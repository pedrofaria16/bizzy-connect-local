const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const candidaturaRoutes = require("./routes/candidaturas");
const notificationsRoutes = require("./routes/notifications");
const chatRoutes = require("./routes/chat");
const reviewsRoutes = require("./routes/reviews");
const servicosRoutes = require("./routes/servicos");

dotenv.config();


const fs = require('fs');
const uploadsDir = require('path').join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();


app.use(cors({
  // Allow common local dev ports (Vite default 5173 & custom 8080)
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
  credentials: true
}));

app.use(helmet.frameguard({ action: "deny" }));


// Servir arquivos estáticos da pasta uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Usar express.json() globalmente para aceitar JSON em todas as rotas (não afeta uploads com multer)
// Aumentar o limite para permitir payloads maiores (ex.: imagens em base64)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/candidaturas", candidaturaRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/servicos", servicosRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
  // ATENÇÃO: usar migrations em produção. Para desenvolvimento, sincronizar banco.
  // Use force: true apenas em desenvolvimento para resetar tabelas se houver conflitos
  await sequelize.sync({ alter: true }).catch(async (err) => {
    console.log('Erro ao usar alter, tentando sync normal:', err.message);
    await sequelize.sync();
  });
  console.log('Banco sincronizado');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
  }
}

start();
