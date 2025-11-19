const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar notificações do usuário autenticado
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const notifs = await Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar notificação como lida
router.post('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (!notif) return res.status(404).json({ error: 'Notificação não encontrada' });
    if (notif.userId !== req.userId) return res.status(403).json({ error: 'Não autorizado' });
    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
