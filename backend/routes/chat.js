const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Obter conversas do usuário autenticado, incluindo info do contato (outro usuário)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const convs = await Conversation.findAll({ where: { [require('sequelize').Op.or]: [{ userAId: userId }, { userBId: userId }] } });
    const User = require('../models/User');
    const result = [];
    for (const conv of convs) {
      const otherId = conv.userAId === userId ? conv.userBId : conv.userAId;
      const other = await User.findByPk(otherId, { attributes: ['id', 'name', 'foto', 'telefone'] });
      result.push({ conversation: conv, otherUser: other });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar/pegar conversa entre dois usuários (autenticado)
router.post('/conversation', auth, async (req, res) => {
  try {
    const { userAId, userBId } = req.body;
    let conv = await Conversation.findOne({ where: { userAId, userBId } });
    if (!conv) conv = await Conversation.findOne({ where: { userAId: userBId, userBId: userAId } });
    if (!conv) conv = await Conversation.create({ userAId, userBId });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar mensagens de uma conversa
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const msgs = await Message.findAll({ where: { conversationId: req.params.conversationId }, order: [['createdAt', 'ASC']] });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar mensagem (autenticado)
router.post('/messages', auth, async (req, res) => {
  try {
    const { conversationId, toUserId, text } = req.body;
    const fromUserId = req.userId;
    const msg = await Message.create({ conversationId, fromUserId, toUserId, text });
    // criar notificação para o destinatário
    try {
      await Notification.create({ userId: toUserId, type: 'message', data: { conversationId, fromUserId, text } });
    } catch (e) { console.error('Erro criando notificação de mensagem:', e); }
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
