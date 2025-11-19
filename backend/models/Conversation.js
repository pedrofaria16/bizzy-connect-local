const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userAId: { type: DataTypes.INTEGER, allowNull: false },
  userBId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Conversation;
