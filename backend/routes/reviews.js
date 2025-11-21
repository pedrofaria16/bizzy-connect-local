const express = require('express');
const Review = require('../models/Review');
const Servico = require('../models/Servico');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sequelize = require('../config/db');

const router = express.Router();
const ReviewModel = Review;

// Criar avaliação
router.post('/', async (req, res) => {
  try {
    const { servicoId, fromUserId, toUserId, rating, comment } = req.body;
    // validar que o serviço existe
    const serv = await Servico.findByPk(servicoId);
    if (!serv) return res.status(404).json({ error: 'Serviço não encontrado' });
    // permitir avaliação apenas entre participantes
    if (Number(fromUserId) !== Number(serv.contratanteId) && Number(fromUserId) !== Number(serv.contratadoId)) {
      return res.status(403).json({ error: 'Somente participantes do serviço podem avaliar' });
    }
    // permitir avaliar quando o serviço estiver 'feito' ou quando quem confirma (contratante/contratado)
    // já confirmou (para que, ao marcar como feito, a parte que confirmou possa avaliar imediatamente)
    const fromIsContratante = Number(fromUserId) === Number(serv.contratanteId);
    const fromIsContratado = Number(fromUserId) === Number(serv.contratadoId);
    const canEvaluate = serv.status === 'feito' || (fromIsContratante && serv.contratanteConfirmou) || (fromIsContratado && serv.contratadoConfirmou);
    if (!canEvaluate) return res.status(400).json({ error: 'Avaliação só permitida após confirmação do serviço' });
    // impedir avaliações duplicadas pelo mesmo usuário para o mesmo serviço
    const existing = await Review.findOne({ where: { servicoId, fromUserId } });
    if (existing) return res.status(400).json({ error: 'Você já avaliou este serviço' });
    const review = await Review.create({ servicoId, fromUserId, toUserId, rating, comment });
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
    // garantir associação local para poder incluir o autor
    try {
      Review.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
    } catch (e) { /* ignore if already associated */ }

    const reviews = await Review.findAll({ where: { toUserId: userId }, include: [{ model: User, as: 'fromUser', attributes: ['id', 'name', 'foto'] }], order: [['createdAt', 'DESC']] });
    // calcular média e contagem
    const count = reviews.length;
    const average = count === 0 ? 0 : (reviews.reduce((s, r) => s + (r.rating || 0), 0) / count);
    // formatar retorno: reviews + meta
    res.json({ reviews, avg: Number(average.toFixed(2)), count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resumo de médias/contagens para múltiplos usuários
router.get('/summary', async (req, res) => {
  try {
    const { userIds } = req.query;
    if (!userIds) return res.status(400).json({ error: 'userIds é obrigatório' });
    const ids = String(userIds).split(',').map(s => Number(s)).filter(Boolean);
    if (ids.length === 0) return res.json({});
    const results = await Review.findAll({
      attributes: ['toUserId', [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'], [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
      where: { toUserId: ids },
      group: ['toUserId'],
      raw: true,
    });
    const map = {};
    for (const r of results) {
      map[r.toUserId] = { avg: Number(Number(r.avgRating).toFixed(2)), count: Number(r.count) };
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar avaliações de um serviço (servicoId)
router.get('/servico/:id', async (req, res) => {
  try {
    const servicoId = req.params.id;
    if (!servicoId) return res.status(400).json({ error: 'servicoId é obrigatório' });
    try {
      Review.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
    } catch (e) { }
    const reviews = await Review.findAll({ where: { servicoId }, include: [{ model: User, as: 'fromUser', attributes: ['id', 'name', 'foto'] }], order: [['createdAt', 'DESC']] });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

