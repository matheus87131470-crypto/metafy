/**
 * api/match/matchById.js
 * Endpoint Express para buscar detalhes de uma partida específica
 */

const rapidApiClient = require('../../services/rapidapi-client');

// Cache por matchId
const matchCache = new Map();
const CACHE_DURATION = 60000; // 60 segundos

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extrair matchId da URL
    // Vercel: req.query.id
    // Express: req.params.id
    const matchId = req.query.id || req.params?.id;
    
    if (!matchId) {
      return res.status(400).json({
        success: false,
        error: 'matchId é obrigatório'
      });
    }

    // Verificar cache
    const cached = matchCache.get(matchId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`✅ Retornando match ${matchId} do cache`);
      return res.status(200).json({
        success: true,
        match: cached.data,
        cached: true
      });
    }

    console.log(`🔄 Buscando detalhes do match ${matchId}...`);
    
    // Buscar dados reais
    const match = await rapidApiClient.getMatchDetails(matchId);
    
    // Salvar no cache
    matchCache.set(matchId, {
      data: match,
      timestamp: now
    });
    
    console.log(`✅ Detalhes do match ${matchId} encontrados`);
    
    return res.status(200).json({
      success: true,
      match,
      cached: false
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes da partida:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar detalhes da partida',
      message: error.message
    });
  }
};
