/**
 * api/matches/today.js
 * Endpoint Express para buscar partidas agendadas de hoje (SportAPI7)
 * Suporta override de data via query: ?date=YYYY-MM-DD
 */

const rapidApiClient = require('../../services/rapidapi-client');

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
    // Permitir override de data via query string
    let customDate = null;
    if (req.query.date) {
      // Validar formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(req.query.date)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        });
      }
      customDate = req.query.date;
      console.log('📅 Data customizada recebida:', customDate);
    }

    const dateStr = customDate || new Date().toISOString().split('T')[0];
    console.log('🔄 GET /api/matches/today');
    console.log('   📅 Data para busca:', dateStr);
    console.log('   🌐 Endpoint SportAPI7: /scheduled-events/' + dateStr);
    
    // Buscar dados reais (já tem cache de 60s embutido se não for customDate)
    const matches = await rapidApiClient.getTodayMatches(customDate);
    
    console.log(`✅ ${matches.length} partidas retornadas ao cliente`);
    
    return res.status(200).json({
      success: true,
      count: matches.length,
      date: dateStr,
      matches
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar partidas:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar partidas',
      message: error.message
    });
  }
};
