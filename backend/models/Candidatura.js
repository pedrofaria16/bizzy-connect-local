const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Candidatura = sequelize.define('Candidatura', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  postId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // quem se candidatou
  status: { type: DataTypes.STRING, defaultValue: 'pendente' }, // pendente, aceito, recusado
});

module.exports = Candidatura;
