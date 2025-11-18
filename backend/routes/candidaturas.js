const express = require('express');
const Candidatura = require('../models/Candidatura');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// Listar candidaturas por usuário (quem se candidatou)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });
    const candidaturas = await Candidatura.findAll({ where: { userId } });
    // Anexar informações do post e do dono do post para cada candidatura
    const results = [];
    for (const c of candidaturas) {
      const post = await Post.findByPk(c.postId, { include: [User] });
      results.push({ ...c.dataValues, Post: post });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
