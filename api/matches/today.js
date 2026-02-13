/**
 * api/matches/today.js
 * Endpoint serverless para buscar partidas de hoje
 */

const rapidApiClient = require('../../services/rapidapi-client');

// Cache simples em memória
let cachedData = null;
let cacheTimestamp = null;
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
    // Verificar cache
    const now = Date.now();
    if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Retornando dados do cache');
      return res.status(200).json({
        success: true,
        matches: cachedData,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      });
    }

    console.log('🔄 Buscando dados da RapidAPI...');
    
    // Buscar dados reais
    const matches = await rapidApiClient.getTodayMatches();
    
    // Atualizar cache
    cachedData = matches;
    cacheTimestamp = now;
    
    console.log(`✅ ${matches.length} partidas encontradas`);
    
    return res.status(200).json({
      success: true,
      matches,
      cached: false
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar partidas:', error.message);
    
    // Se temos cache antigo, retornar mesmo que expirado
    if (cachedData) {
      console.log('⚠️ Retornando cache antigo devido ao erro');
      return res.status(200).json({
        success: true,
        matches: cachedData,
        cached: true,
        warning: 'Dados do cache devido a erro na API'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar partidas',
      message: error.message
    });
  }
};
