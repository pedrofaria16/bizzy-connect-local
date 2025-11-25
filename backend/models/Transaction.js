const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // 'credit' or 'debit'
  valor: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  titulo: { type: DataTypes.STRING, allowNull: true },
  servicoId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'Transactions'
});

module.exports = Transaction;
