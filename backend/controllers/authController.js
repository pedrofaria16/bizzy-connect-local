const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UniqueConstraintError } = require("sequelize");

exports.cadastro = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validações simples de back
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Preencha nome, email e senha." });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "A senha deve ter pelo menos 6 caracteres." });
    }

    const newUser = await User.create({ name, email, password });

    // não retornar hash de senha
    const { id } = newUser;
    return res.status(201).json({
      msg: "Usuário cadastrado com sucesso",
      user: { id, name, email },
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({ msg: "Email já cadastrado." });
    }
    console.error(err);
    return res.status(500).json({ msg: "Erro no servidor." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Informe email e senha." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Usuário não encontrado." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Senha inválida." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Erro no servidor." });
  }
};
