const express = require('express');
const Servico = require('../models/Servico');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const sequelize = require('../config/db');

// Listar serviços do usuário autenticado (contratado ou contratante)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const asContratado = await Servico.findAll({ where: { contratadoId: userId }, order: [['createdAt','DESC']] });
    const asContratante = await Servico.findAll({ where: { contratanteId: userId }, order: [['createdAt','DESC']] });
    res.json({ asContratado, asContratante });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar servico como feito (e notificar contratante)
// Confirmar conclusão do serviço por uma das partes. O serviço só passa a 'feito'
// quando ambas as partes (contratante e contratado) confirmarem.
router.post('/:id/feito', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const serv = await Servico.findByPk(req.params.id);
    if (!serv) return res.status(404).json({ error: 'Serviço não encontrado' });

    let changed = false;
    // Se for o contratado, só pode confirmar se o contratante já confirmou
    if (Number(userId) === Number(serv.contratadoId)) {
      if (!serv.contratanteConfirmou) {
        return res.status(400).json({ error: 'Aguardando confirmação do contratante antes do contratado confirmar' });
      }
      // Additional rule: only allow contratado to confirm after contratante has submitted their avaliação
      const contratanteReview = await Review.findOne({ where: { servicoId: serv.id, fromUserId: serv.contratanteId } });
      if (!contratanteReview) {
        return res.status(400).json({ error: 'Aguardando avaliação do contratante antes do contratado confirmar' });
      }
      if (!serv.contratadoConfirmou) { serv.contratadoConfirmou = true; changed = true; }
    }
    // Se for o contratante, marcar contratanteConfirmou
    else if (Number(userId) === Number(serv.contratanteId)) {
      if (!serv.contratanteConfirmou) { serv.contratanteConfirmou = true; changed = true; }
    } else {
      return res.status(403).json({ error: 'Somente participantes do serviço podem confirmar' });
    }

    // Se ambas confirmaram, tentar marcar status como 'feito' (apenas uma vez)
    let finishedNow = false;
    if (serv.contratadoConfirmou && serv.contratanteConfirmou && serv.status !== 'feito') {
      // Antes de finalizar, checar saldo do contratante e efetuar transferência dentro de uma transação
      try {
        const valor = Number(serv.valor || 0) || 0;
        await sequelize.transaction(async (t) => {
          // carregar usuários dentro da transação
          const contratante = await User.findByPk(serv.contratanteId, { transaction: t });
          const contratado = await User.findByPk(serv.contratadoId, { transaction: t });
          if (!contratante || !contratado) {
            throw new Error('Usuário envolvido no serviço não encontrado');
          }
          if (Number(contratante.balance || 0) < valor) {
            // provocar rollback lançando erro reconhecível
            const err = new Error('Saldo insuficiente');
            err.name = 'SaldoInsuficiente';
            throw err;
          }

          // efetuar transferência: debitar contratante, creditar contratado
          contratante.balance = Number(contratante.balance || 0) - valor;
          contratado.balance = Number(contratado.balance || 0) + valor;

          // Garantir que o saldo não fique negativo (checagem de segurança)
          if (contratante.balance < 0) {
            const err = new Error('Saldo insuficiente');
            err.name = 'SaldoInsuficiente';
            throw err;
          }

          // salvar usuários e marcar serviço como finalizado dentro da transação
          await contratante.save({ transaction: t });
          await contratado.save({ transaction: t });
          serv.status = 'feito';
          // salvar serviço dentro da transação
          await serv.save({ transaction: t });

          // registrar transações relacionadas ao serviço
          try {
            const Transaction = require('../models/Transaction');
            await Transaction.create({ userId: contratante.id, type: 'debit', valor: valor, titulo: `Pagamento serviço #${serv.id}`, servicoId: serv.id }, { transaction: t });
            await Transaction.create({ userId: contratado.id, type: 'credit', valor: valor, titulo: `Recebimento serviço #${serv.id}`, servicoId: serv.id }, { transaction: t });

            // Recompute balances from transactions to keep canonical source-of-truth
            const contratanteCredits = await Transaction.sum('valor', { where: { userId: contratante.id, type: 'credit' }, transaction: t }) || 0;
            const contratanteDebits = await Transaction.sum('valor', { where: { userId: contratante.id, type: 'debit' }, transaction: t }) || 0;
            contratante.balance = Number(contratanteCredits) - Number(contratanteDebits);
            await contratante.save({ transaction: t });

            const contratadoCredits = await Transaction.sum('valor', { where: { userId: contratado.id, type: 'credit' }, transaction: t }) || 0;
            const contratadoDebits = await Transaction.sum('valor', { where: { userId: contratado.id, type: 'debit' }, transaction: t }) || 0;
            contratado.balance = Number(contratadoCredits) - Number(contratadoDebits);
            await contratado.save({ transaction: t });
          } catch (e) {
            console.error('Não foi possível criar transações para o serviço ou recomputar saldos:', e);
            throw e;
          }

          finishedNow = true;
        });
      } catch (e) {
        if (e && e.name === 'SaldoInsuficiente') {
          return res.status(400).json({ error: 'Saldo insuficiente' });
        }
        console.error('Erro ao processar finalização do serviço (transferência):', e);
        return res.status(500).json({ error: 'Erro ao processar pagamento' });
      }
    }

    if (changed || finishedNow) await serv.save();

    // Se o serviço acabou agora, criar notificação para a outra parte
    if (finishedNow) {
      try {
        await Notification.create({ userId: serv.contratanteId, type: 'servico_feito', data: { servicoId: serv.id } });
        await Notification.create({ userId: serv.contratadoId, type: 'servico_feito', data: { servicoId: serv.id } });
      } catch (e) { console.error('Erro criando notificação servico_feito', e); }
    }

    res.json({ serv, finishedNow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar um serviço (permitido apenas para participantes)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const serv = await Servico.findByPk(req.params.id);
    if (!serv) return res.status(404).json({ error: 'Serviço não encontrado' });
    if (Number(userId) !== Number(serv.contratadoId) && Number(userId) !== Number(serv.contratanteId)) {
      return res.status(403).json({ error: 'Somente participantes podem excluir o serviço' });
    }
    await serv.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
