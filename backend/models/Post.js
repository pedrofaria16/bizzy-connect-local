const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // quem criou
  titulo: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  valor: { type: DataTypes.FLOAT, allowNull: false },
  data: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: 'aberto' },
  selecionadoId: { type: DataTypes.INTEGER, allowNull: true }, // quem foi aceito
  foto: { type: DataTypes.TEXT, allowNull: true },
  telefone: { type: DataTypes.STRING, allowNull: true },
  endereco: { type: DataTypes.STRING, allowNull: true },
  lat: { type: DataTypes.FLOAT, allowNull: true },
  lon: { type: DataTypes.FLOAT, allowNull: true },
});
module.exports = Post;
