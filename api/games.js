/**
 * api/games.js - Endpoint Serverless para Buscar Jogos
 * GET /api/games
 */

const GamesService = require('../services/games-service');

const gamesService = new GamesService();

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Apenas GET permitido' });
  }

  try {
    const games = await gamesService.getTodayGames();
    
    // Retornar jogos reais ou vazio (SEM FALLBACK)
    return res.status(200).json({
      success: true,
      count: games.length,
      games: games,
      message: games.length === 0 ? 'Nenhum jogo encontrado para hoje' : null
    });
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    
    // Retornar vazio em caso de erro (SEM MOCK DATA)
    return res.status(200).json({
      success: false,
      count: 0,
      games: [],
      error: 'Erro ao buscar jogos da API'
    });
  }
};
