const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Servico = sequelize.define('Servico', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contratanteId: { type: DataTypes.INTEGER, allowNull: false },
  contratadoId: { type: DataTypes.INTEGER, allowNull: false },
  postId: { type: DataTypes.INTEGER, allowNull: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'fazendo' }, // fazendo, feito
  contratanteConfirmou: { type: DataTypes.BOOLEAN, defaultValue: false },
  contratadoConfirmou: { type: DataTypes.BOOLEAN, defaultValue: false },
  valor: { type: DataTypes.FLOAT, allowNull: true },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  endereco: { type: DataTypes.STRING, allowNull: true },
  telefone: { type: DataTypes.STRING, allowNull: true },
  lat: { type: DataTypes.FLOAT, allowNull: true },
  lon: { type: DataTypes.FLOAT, allowNull: true },
});

module.exports = Servico;
