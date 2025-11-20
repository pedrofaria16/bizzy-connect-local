const express = require('express');
const Servico = require('../models/Servico');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

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
      if (!serv.contratadoConfirmou) { serv.contratadoConfirmou = true; changed = true; }
    }
    // Se for o contratante, marcar contratanteConfirmou
    else if (Number(userId) === Number(serv.contratanteId)) {
      if (!serv.contratanteConfirmou) { serv.contratanteConfirmou = true; changed = true; }
    } else {
      return res.status(403).json({ error: 'Somente participantes do serviço podem confirmar' });
    }

    // Se ambas confirmaram, marcar status como 'feito' (apenas uma vez)
    let finishedNow = false;
    if (serv.contratadoConfirmou && serv.contratanteConfirmou && serv.status !== 'feito') {
      serv.status = 'feito';
      finishedNow = true;
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
