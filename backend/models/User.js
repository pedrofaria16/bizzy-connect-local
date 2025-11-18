const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, allowNull: false, unique: true },
  endereco: { type: DataTypes.STRING, allowNull: false },
  servicos: { type: DataTypes.STRING, allowNull: false }, // lista separada por vírgula
  telefone: { type: DataTypes.STRING },
  nascimento: { type: DataTypes.STRING },
  foto: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT, allowNull: true },
  sexo: { type: DataTypes.STRING, allowNull: true},
});

// Hash antes de salvar
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});


// Associações de modelos
const Post = require('./Post');
const Candidatura = require('./Candidatura');
const { all } = require("../routes/auth");
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
Post.hasMany(Candidatura, { foreignKey: 'postId' });
Candidatura.belongsTo(Post, { foreignKey: 'postId' });
Candidatura.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;
