const express = require('express');
const Post = require('../models/Post');
const Candidatura = require('../models/Candidatura');
const User = require('../models/User');

const router = express.Router();
// Excluir post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });
    // Remove candidaturas associadas antes de excluir o post para evitar notificações órfãs
    try {
      await Candidatura.destroy({ where: { postId: post.id } });
    } catch (e) {
      // se falhar, seguimos para tentar excluir o post mesmo assim
      console.error('Erro ao remover candidaturas associadas:', e);
    }
    await post.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Função utilitária para geocodificar CEP usando Nominatim
const fetch = require('node-fetch');
async function geocodeCep(cep) {
  if (!cep) return null;
  const apenasNumeros = cep.replace(/\D/g, "");
  let cepFormatado = apenasNumeros;
  if (apenasNumeros.length === 8) {
    cepFormatado = apenasNumeros.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&country=Brazil&postalcode=${encodeURIComponent(cepFormatado)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'bizzy-backend/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {
    // Falha silenciosa
  }
  return null;
}

// Função utilitária para geocodificar cidade usando Nominatim
async function geocodeCidade(cidade) {
  if (!cidade) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&country=Brazil&city=${encodeURIComponent(cidade)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'bizzy-backend/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {}
  return null;
}

// Criar post com geocodificação
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/posts req.body:', req.body);
    let { cep, cidade } = req.body;
    let lat = null, lon = null;
    if (cep) {
      console.log('[DEBUG] CEP recebido:', cep);
      const coords = await geocodeCep(cep);
      console.log('[DEBUG] Resultado geocodeCep:', coords);
      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      } else {
        // Tenta geocodificar pela cidade
        let cidadeParaBusca = cidade;
        if (!cidadeParaBusca && req.body.endereco) {
          // Extrai cidade do endereço: assume formato "rua, numero, bairro, cidade, CEP: ..."
          const partes = req.body.endereco.split(',').map(s => s.trim());
          if (partes.length >= 4) {
            cidadeParaBusca = partes[partes.length - 2];
          }
        }
        console.log('[DEBUG] cidade recebida:', cidade, '| cidade extraída:', cidadeParaBusca);
        if (cidadeParaBusca) {
          const cidadeCoords = await geocodeCidade(cidadeParaBusca);
          if (cidadeCoords) {
            lat = cidadeCoords.lat;
            lon = cidadeCoords.lon;
            console.log('[DEBUG] Usando coordenadas da cidade:', cidadeParaBusca, cidadeCoords);
          } else {
            console.error('[ERRO] Não foi possível obter latitude/longitude para a cidade:', cidadeParaBusca);
            return res.status(400).json({ error: 'Não foi possível localizar o endereço informado. Tente outro CEP ou cidade.' });
          }
        } else {
          console.error('[ERRO] Não foi possível obter cidade para geocodificação.');
          return res.status(400).json({ error: 'Não foi possível localizar o endereço informado. Tente outro CEP.' });
        }
      }
    } else {
      console.log('[DEBUG] Nenhum CEP informado no post.');
      return res.status(400).json({ error: 'CEP obrigatório para localização.' });
    }
    const postData = { ...req.body, lat, lon };
    console.log('[DEBUG] Dados enviados para o banco:', postData);
    const post = await Post.create(postData);
    res.status(201).json(post);
  } catch (err) {
    console.error('Erro ao criar post:', err);
    res.status(400).json({ error: err.message, details: err });
  }
});

// Listar todos os posts (pode filtrar por status, data, etc)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      // Quando for pedido posts de um usuário, incluir também as candidaturas e seus usuários
      const posts = await Post.findAll({ where: { userId }, include: [User, Candidatura] });
      // Para cada candidatura, incluir o usuário que se candidatou
      // Sequelize include acima já adiciona Candidatura, mas para incluir User dentro de Candidatura seria necessário configurar associações; como workaround, vamos buscar candidaturas separadamente e anexar.
      for (const post of posts) {
        const candidaturas = await Candidatura.findAll({ where: { postId: post.id }, include: [User] });
        // @ts-ignore
        post.dataValues.Candidaturas = candidaturas;
      }
      return res.json(posts);
    }
    // Caso geral: retorna posts com o usuário criador (sem candidaturas para não poluir)
    const posts = await Post.findAll({ include: [User] });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detalhe de um post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, { include: [User, Candidatura] });
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });

    // Campos que podem ser atualizados diretamente
    const updatable = ['titulo', 'descricao', 'categoria', 'valor', 'telefone', 'endereco', 'cep', 'cidade', 'foto', 'status'];
    updatable.forEach(field => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    // Garantir que valor seja número quando fornecido
    if (req.body.valor !== undefined) {
      const parsed = parseFloat(req.body.valor);
      post.valor = isNaN(parsed) ? 0 : parsed;
    }

    // Atualizar latitude/longitude se houver alteração do endereço/CEP/cidade
    let lat = post.lat;
    let lon = post.lon;

    if (req.body.cep) {
      const coords = await geocodeCep(req.body.cep);
      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      } else {
        // Tenta geocodificar pela cidade (se informada ou extraída do endereco)
        let cidadeParaBusca = req.body.cidade;
        if (!cidadeParaBusca && req.body.endereco) {
          const partes = req.body.endereco.split(',').map(s => s.trim());
          if (partes.length >= 4) cidadeParaBusca = partes[partes.length - 2];
        }
        if (cidadeParaBusca) {
          const cidadeCoords = await geocodeCidade(cidadeParaBusca);
          if (cidadeCoords) {
            lat = cidadeCoords.lat;
            lon = cidadeCoords.lon;
          } else {
            return res.status(400).json({ error: 'Não foi possível localizar o endereço informado. Tente outro CEP ou cidade.' });
          }
        } else {
          return res.status(400).json({ error: 'Não foi possível localizar o endereço informado. Tente outro CEP.' });
        }
      }
    } else if (req.body.cidade || req.body.endereco) {
      // Se mudou apenas a cidade ou o endereço sem CEP, tente geocodificar pela cidade
      let cidadeParaBusca = req.body.cidade;
      if (!cidadeParaBusca && req.body.endereco) {
        const partes = req.body.endereco.split(',').map(s => s.trim());
        if (partes.length >= 4) cidadeParaBusca = partes[partes.length - 2];
      }
      if (cidadeParaBusca) {
        const cidadeCoords = await geocodeCidade(cidadeParaBusca);
        if (cidadeCoords) {
          lat = cidadeCoords.lat;
          lon = cidadeCoords.lon;
        } else {
          // Se não conseguir geocodificar, mantemos lat/lon antigos (não falhamos)
          console.warn('[WARN] Não foi possível geocodificar a cidade informada durante atualização:', cidadeParaBusca);
        }
      }
    }

    post.lat = lat;
    post.lon = lon;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Erro ao atualizar post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Candidatar-se a um post
router.post('/:id/candidatar', async (req, res) => {
  try {
    const { userId } = req.body;
    const candidatura = await Candidatura.create({ postId: req.params.id, userId });
    res.status(201).json(candidatura);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar candidaturas de um post
router.get('/:id/candidaturas', async (req, res) => {
  try {
    const candidaturas = await Candidatura.findAll({ where: { postId: req.params.id }, include: [User] });
    res.json(candidaturas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aceitar candidato
router.post('/:id/aceitar', async (req, res) => {
  try {
    const { candidaturaId } = req.body;
    const candidatura = await Candidatura.findByPk(candidaturaId);
    if (!candidatura) return res.status(404).json({ error: 'Candidatura não encontrada' });
    candidatura.status = 'aceito';
    await candidatura.save();
    // Atualiza post
    const post = await Post.findByPk(req.params.id);
    post.selecionadoId = candidatura.userId;
    post.status = 'em andamento';
    await post.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
