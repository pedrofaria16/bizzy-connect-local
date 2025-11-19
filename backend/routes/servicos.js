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
router.post('/:id/feito', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const serv = await Servico.findByPk(req.params.id);
    if (!serv) return res.status(404).json({ error: 'Serviço não encontrado' });
    // somente o contratado pode marcar como feito
    if (serv.contratadoId !== userId) return res.status(403).json({ error: 'Somente o contratado pode marcar como feito' });
    serv.status = 'feito';
    await serv.save();
    // notificar contratante que serviço foi marcado como feito
    try {
      await Notification.create({ userId: serv.contratanteId, type: 'servico_feito', data: { servicoId: serv.id } });
    } catch (e) { console.error('Erro criando notificação servico_feito', e); }
    res.json(serv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
