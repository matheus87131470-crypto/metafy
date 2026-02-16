/**
 * api/matches/today.js
 * Endpoint Express para buscar partidas agendadas de hoje (SportAPI7)
 * Suporta override de data via query: ?date=YYYY-MM-DD
 * Retorna apenas principais ligas europeias e sul-americanas
 * Suporta modo debug: ?debug=1
 */

const rapidApiClient = require('../../services/rapidapi-client');

// Whitelist de principais ligas (usando Sets para lookup O(1))
const ALLOWED_SLUGS = new Set([
  'premier-league',
  'laliga',
  'la-liga',
  'serie-a',
  'bundesliga',
  'ligue-1',
  'uefa-champions-league',
  'uefa-europa-league',
  'uefa-europa-conference-league',
  'copa-libertadores',
  'copa-sudamericana',
  'brasileirao-serie-a',
  'brasileirao-serie-b',
  'copa-do-brasil'
]);

const ALLOWED_NAMES = new Set([
  'Premier League',
  'LaLiga',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  'Copa Libertadores',
  'Copa Sudamericana',
  'Brasileirão Série A',
  'Brasileirao Serie A',
  'Serie A (Brazil)',
  'Brasileirão Série B',
  'Brasileirao Serie B',
  'Copa do Brasil'
]);

/**
 * Filtrar apenas partidas de ligas principais
 * Prioriza slug (mais estável), usa nome como fallback
 */
function filterMajorLeagues(matches) {
  return matches.filter(match => {
    // Prioridade 1: verificar slug (mais confiável)
    if (match.leagueSlug && ALLOWED_SLUGS.has(match.leagueSlug.toLowerCase())) {
      return true;
    }
    
    // Prioridade 2: verificar nome exato
    if (match.league && ALLOWED_NAMES.has(match.league)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Ordenar partidas por status (live > notstarted > finished) e depois por kickoff
 */
function sortMatches(matches) {
  const statusRank = {
    'live': 0,
    'inprogress': 0,
    'notstarted': 1,
    'scheduled': 1,
    'finished': 2,
    'ended': 2,
    'canceled': 3,
    'postponed': 3,
    'unknown': 4
  };

  return matches.sort((a, b) => {
    // Primeiro: ordenar por status
    const rankA = statusRank[a.status] ?? 99;
    const rankB = statusRank[b.status] ?? 99;
    
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    // Segundo: ordenar por kickoff (ascendente)
    if (!a.kickoff) return 1;
    if (!b.kickoff) return -1;
    const timeA = new Date(a.kickoff).getTime();
    const timeB = new Date(b.kickoff).getTime();
    return timeA - timeB;
  });
}

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
    // Modo debug
    const debugMode = req.query.debug === '1';
    
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
    
    // Buscar dados reais (já tem cache de 60s embutido se não for customDate)
    let matches = await rapidApiClient.getTodayMatches(customDate);
    const totalBeforeFilter = matches.length;
    
    // Debug: coletar sample de slugs
    let sampleSlugs = [];
    if (debugMode && matches.length > 0) {
      sampleSlugs = [...new Set(matches.slice(0, 20).map(m => m.leagueSlug || m.league).filter(Boolean))];
    }
    
    // Filtrar apenas ligas principais
    matches = filterMajorLeagues(matches);
    const totalAfterFilter = matches.length;
    
    if (debugMode) {
      console.log(`📊 DEBUG: Total antes do filtro: ${totalBeforeFilter}`);
      console.log(`🎯 DEBUG: Total após filtro: ${totalAfterFilter}`);
      console.log(`🏆 DEBUG: Sample slugs:`, sampleSlugs);
    }
    
    // Ordenar por status e kickoff
    matches = sortMatches(matches);
    
    const response = {
      success: true,
      count: matches.length,
      date: dateStr,
      matches
    };

    // Adicionar info de debug se solicitado
    if (debugMode) {
      response.debug = {
        totalBeforeFilter,
        totalAfterFilter,
        sampleSlugs
      };
    }
    
    return res.status(200).json(response);
    
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
