/**
 * routes/matches-live.js
 * Endpoint Express para buscar partidas ao vivo
 */

import rapidApiClient from '../services/rapidapi-client.js';

const handler = async (req, res) => {
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
    console.log('🔄 Buscando partidas ao vivo...');
    
    // Buscar dados reais
    const matches = await rapidApiClient.getLiveMatches();
    
    console.log(`✅ ${matches.length} partidas ao vivo encontradas`);
    
    return res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar partidas ao vivo:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar partidas ao vivo',
      message: error.message
    });
  }
};

export default handler;
