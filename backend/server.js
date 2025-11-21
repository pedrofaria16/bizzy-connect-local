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

    // CHECAGEM RÁPIDA DE MIGRAÇÕES: garantir colunas esperadas (ex.: Servicos.endereco)
    try {
      const qi = sequelize.getQueryInterface();
      const SequelizeLib = require('sequelize');
      const DataTypes = SequelizeLib.DataTypes || SequelizeLib;
      // Tabela criada por Sequelize usa pluralização: 'Servicos'
      const tableName = 'Servicos';
      let desc = null;
      try {
        desc = await qi.describeTable(tableName);
      } catch (e) {
        console.warn('[migrate] tabela', tableName, 'não encontrada ou erro ao descrever:', e.message || e);
      }
      if (desc) {
        // colunas que esperamos existir na tabela Servicos
        const expected = {
          endereco: { type: DataTypes.STRING || DataTypes.TEXT, allowNull: true },
          telefone: { type: DataTypes.STRING, allowNull: true },
          lat: { type: DataTypes.FLOAT, allowNull: true },
          lon: { type: DataTypes.FLOAT, allowNull: true },
          contratanteConfirmou: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          contratadoConfirmou: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
        };
        for (const [col, def] of Object.entries(expected)) {
          if (!desc[col]) {
            try {
              console.log(`[migrate] adicionando coluna faltante ${col} em ${tableName}`);
              await qi.addColumn(tableName, col, def);
            } catch (e) {
              console.error('[migrate] falha ao adicionar coluna', col, e.message || e);
            }
          }
        }
      }
      // Also ensure the Posts table has the `tipo` column we recently added to the model
      try {
        const postsDesc = await qi.describeTable('Posts');
        if (postsDesc && !postsDesc.tipo) {
          console.log('[migrate] adicionando coluna faltante tipo em Posts');
          await qi.addColumn('Posts', 'tipo', { type: DataTypes.STRING, allowNull: true });
        }
      } catch (e) {
        console.warn('[migrate] não foi possível verificar/adicionar coluna `tipo` em Posts:', e.message || e);
      }
    } catch (e) {
      console.warn('Erro na etapa de migração leve:', e.message || e);
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
  }
}

start();
