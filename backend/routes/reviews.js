const express = require('express');
const Review = require('../models/Review');
const Servico = require('../models/Servico');
const Notification = require('../models/Notification');

const router = express.Router();

// Criar avaliação
router.post('/', async (req, res) => {
  try {
    const { servicoId, fromUserId, toUserId, rating, comment } = req.body;
    const review = await Review.create({ servicoId, fromUserId, toUserId, rating, comment });
    // marcar servico como feito
    try {
      const serv = await Servico.findByPk(servicoId);
      if (serv) {
        serv.status = 'feito';
        await serv.save();
      }
    } catch (e) { console.error('Erro marcando servico como feito:', e); }
    // notificar avaliado
    try {
      await Notification.create({ userId: toUserId, type: 'review', data: { reviewId: review.id, fromUserId } });
    } catch (e) { console.error('Erro criando notificação de review:', e); }
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar avaliações de um usuário
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });
    const reviews = await Review.findAll({ where: { toUserId: userId }, order: [['createdAt', 'DESC']] });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
