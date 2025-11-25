const express = require('express');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const sequelize = require('../config/db');

const router = express.Router();

// List transactions for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const txs = await Transaction.findAll({ where: { userId }, order: [['createdAt','DESC']] });
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a transaction (credit or debit) for authenticated user
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { type, valor, titulo, servicoId } = req.body;
    if (!['credit','debit'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' });
    const amount = Number(valor || 0) || 0;
    if (amount <= 0) return res.status(400).json({ error: 'Valor inválido' });

    // perform creation inside a transaction and update user's balance accordingly
    let created = null;
    await sequelize.transaction(async (t) => {
      created = await Transaction.create({ userId, type, valor: amount, titulo, servicoId: servicoId || null }, { transaction: t });

      // recompute balance from existing transactions for safety
      const credits = await Transaction.sum('valor', { where: { userId, type: 'credit' }, transaction: t }) || 0;
      const debits = await Transaction.sum('valor', { where: { userId, type: 'debit' }, transaction: t }) || 0;
      const newBalance = Number(credits) - Number(debits);
      const user = await User.findByPk(userId, { transaction: t });
      if (user) {
        user.balance = newBalance;
        await user.save({ transaction: t });
      }
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
