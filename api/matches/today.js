/**
 * api/matches/today.js
 * Endpoint Express para buscar partidas agendadas de hoje (SportAPI7)
 * Suporta override de data via query: ?date=YYYY-MM-DD
 * Retorna apenas principais ligas europeias e sul-americanas
 */

const rapidApiClient = require('../../services/rapidapi-client');

// Whitelist de principais ligas (por nome e slug)
const MAJOR_LEAGUES = {
  names: [
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
    'Serie A',
    'Serie B',
    'Copa do Brasil',
    'Brasileirão Série A',
    'Brasileirão Série B'
  ],
  slugs: [
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
    'copa-do-brasil',
    'serie-a-brazil',
    'serie-b-brazil'
  ]
};

/**
 * Filtrar apenas partidas de ligas principais
 */
function filterMajorLeagues(matches) {
  return matches.filter(match => {
    const leagueName = (match.league || '').toLowerCase();
    const leagueSlug = (match.leagueSlug || '').toLowerCase();
    
    // Verificar se o nome da liga está na whitelist
    const nameMatch = MAJOR_LEAGUES.names.some(name => 
      leagueName.includes(name.toLowerCase())
    );
    
    // Verificar se o slug da liga está na whitelist
    const slugMatch = MAJOR_LEAGUES.slugs.some(slug => 
      leagueSlug.includes(slug)
    );
    
    return nameMatch || slugMatch;
  });
}

/**
 * Ordenar partidas por status (live > notstarted > finished) e depois por kickoff
 */
function sortMatches(matches) {
  const statusPriority = {
    'live': 1,
    'inprogress': 1,
    'notstarted': 2,
    'scheduled': 2,
    'finished': 3,
    'ended': 3,
    'canceled': 4,
    'postponed': 4
  };

  return matches.sort((a, b) => {
    // Primeiro: ordenar por status
    const priorityA = statusPriority[a.status] || 99;
    const priorityB = statusPriority[b.status] || 99;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Segundo: ordenar por kickoff (ascendente)
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
    let matches = await rapidApiClient.getTodayMatches(customDate);
    console.log(`📊 Total de partidas retornadas: ${matches.length}`);
    
    // Filtrar apenas ligas principais
    matches = filterMajorLeagues(matches);
    console.log(`🎯 Partidas de ligas principais: ${matches.length}`);
    
    // Ordenar por status e kickoff
    matches = sortMatches(matches);
    console.log(`✅ Partidas ordenadas e prontas para retorno`);
    
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
