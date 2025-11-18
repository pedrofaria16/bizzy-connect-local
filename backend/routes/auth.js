// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const upload = require("../config/multer");

const router = express.Router();

// Rota para upload de foto de perfil
router.post("/upload-foto", upload.single("foto"), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "ID do usuário não informado." });
    const user = await User.findByPk(Number(userId));
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
    if (!req.file) return res.status(400).json({ message: "Nenhuma foto enviada." });
    const fotoPath = `/uploads/${req.file.filename}`;
    user.foto = fotoPath;
    await user.save();
    return res.json({ message: "Foto atualizada com sucesso!", foto: fotoPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar foto." });
  }
});

// Rota para buscar dados do usuário pelo id
router.get("/user", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID do usuário não informado." });
    const user = await User.findByPk(Number(id));
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
    // <-- Retornar description e sexo aqui
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      telefone: user.telefone,
      nascimento: user.nascimento,
      endereco: user.endereco,
      servicos: user.servicos,
      foto: user.foto,
      description: user.description ?? "",
      sexo: user.sexo ?? ""
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar usuário." });
  }
});

// Rota para atualizar dados do usuário (/update)
router.put("/update", express.json(), async (req, res) => {
  try {
    // Accept id either in body or query (defensive)
    const id = req.body.id || req.query.id || (req.body.user && req.body.user.id);
    if (!id) return res.status(400).json({ message: "ID do usuário não informado." });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    // Inclui description e sexo na lista de campos atualizáveis
    const updatable = ["name", "email", "telefone", "nascimento", "endereco", "servicos", "foto", "description", "sexo"];
    updatable.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Retorne também description e sexo
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      telefone: user.telefone,
      nascimento: user.nascimento,
      endereco: user.endereco,
      servicos: user.servicos,
      foto: user.foto,
      description: user.description ?? "",
      sexo: user.sexo ?? ""
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
});

// Rota compatível com frontend antigo: /editar
router.put("/editar", express.json(), async (req, res) => {
  try {
    // Debug: log incoming identifiers and body
    console.log('[DEBUG] PUT /api/auth/editar - query:', req.query, 'body:', req.body);
    // Accept id from body or query as a fallback
    const id = req.body.id || req.query.id || (req.body.user && req.body.user.id);
    if (!id) {
      console.warn('[WARN] ID não informado no PUT /api/auth/editar');
      return res.status(400).json({ message: "ID do usuário não informado." });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    const updatable = ["name", "email", "telefone", "nascimento", "endereco", "servicos", "foto", "description", "sexo"];
    updatable.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        user[field] = req.body[field];
      }
    });

    await user.save();
    // Return the updated user including description/sexo
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      telefone: user.telefone,
      nascimento: user.nascimento,
      endereco: user.endereco,
      servicos: user.servicos,
      foto: user.foto,
      description: user.description ?? "",
      sexo: user.sexo ?? ""
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
});

// Rota de cadastro com upload de imagem
router.post("/register", upload.single("foto"), async (req, res) => {
  try {
    const { nome, email, senha, cpf, endereco, servicos, telefone, nascimento, description, sexo } = req.body;
    let foto = null;
    if (req.file) {
      // Salva o caminho relativo da imagem
      foto = `/uploads/${req.file.filename}`;
    }

    // verifica se usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }
    const cpfExists = await User.findOne({ where: { cpf } });
    if (cpfExists) {
      return res.status(400).json({ message: "CPF já cadastrado" });
    }

    // cria usuário (o hook do model faz o hash)
    const user = await User.create({
      name: nome,
      email,
      password: senha,
      cpf,
      endereco,
      servicos,
      telefone,
      nascimento,
      foto,
      description: description ?? null,
      sexo: sexo ?? null
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso!", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Rota de login
router.post("/login", express.json(), async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ message: "Informe email e senha." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Usuário não encontrado." });

    const ok = await bcrypt.compare(senha, user.password);
    if (!ok) return res.status(400).json({ message: "Senha inválida." });

    // Retorna todos os dados do usuário (incluindo description/sexo)
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        endereco: user.endereco,
        servicos: user.servicos,
        telefone: user.telefone,
        nascimento: user.nascimento,
        foto: user.foto,
        description: user.description ?? "",
        sexo: user.sexo ?? ""
      },
      message: "Login realizado com sucesso!"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro no servidor." });
  }
});

module.exports = router;

