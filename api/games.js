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
    
    return res.status(200).json({
      success: true,
      count: games.length,
      games: games
    });
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    
    // Retornar fallback mesmo com erro
    const fallbackGames = gamesService.getFallbackGames();
    return res.status(200).json({
      success: true,
      count: fallbackGames.length,
      games: fallbackGames,
      note: 'Usando dados de fallback'
    });
  }
};
