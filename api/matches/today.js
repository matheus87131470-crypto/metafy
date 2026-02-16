/**
 * api/matches/today.js
 * Endpoint Express para buscar partidas agendadas de hoje (SportAPI7)
 * Suporta override de data via query: ?date=YYYY-MM-DD
 * Retorna apenas principais ligas europeias e sul-americanas
 * Suporta modo debug: ?debug=1
 */

const rapidApiClient = require('../../services/rapidapi-client');

// Competições internacionais (não precisam validar país)
const INTERNATIONAL_SLUGS = new Set([
  'uefa-champions-league',
  'uefa-europa-league',
  'uefa-europa-conference-league',
  'copa-libertadores',
  'copa-sudamericana'
]);

const INTERNATIONAL_NAMES = new Set([
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  'Copa Libertadores',
  'Copa Sudamericana'
]);

// Ligas domésticas principais (country + slug/name)
// Cada entrada: { country, slugs, names }
const DOMESTIC_LEAGUES = [
  {
    country: 'England',
    slugs: ['premier-league'],
    names: ['Premier League']
  },
  {
    country: 'Spain',
    slugs: ['laliga', 'la-liga'],
    names: ['LaLiga', 'La Liga']
  },
  {
    country: 'Italy',
    slugs: ['serie-a'],
    names: ['Serie A']
  },
  {
    country: 'Germany',
    slugs: ['bundesliga'],
    names: ['Bundesliga']
  },
  {
    country: 'France',
    slugs: ['ligue-1'],
    names: ['Ligue 1']
  },
  {
    country: 'Brazil',
    slugs: ['brasileirao-serie-a', 'brasileirao-serie-b', 'copa-do-brasil'],
    names: [
      'Brasileirão Série A',
      'Brasileirao Serie A',
      'Serie A (Brazil)',
      'Brasileirão Série B',
      'Brasileirao Serie B',
      'Copa do Brasil'
    ]
  }
];

/**
 * Verificar se uma partida é de uma liga principal
 * @param {Object} match - { league, leagueSlug, country }
 * @returns {boolean}
 */
function isTopLeague(match) {
  const { league, leagueSlug, country } = match;
  
  // 1. Verificar competições internacionais (não precisam de país)
  if (leagueSlug && INTERNATIONAL_SLUGS.has(leagueSlug.toLowerCase())) {
    return true;
  }
  if (league && INTERNATIONAL_NAMES.has(league)) {
    return true;
  }
  
  // 2. Verificar ligas domésticas (precisam de country + slug/name)
  if (!country) {
    return false; // Sem país, não pode validar liga doméstica
  }
  
  for (const domestic of DOMESTIC_LEAGUES) {
    // Verificar se o país bate
    if (country.toLowerCase() !== domestic.country.toLowerCase()) {
      continue;
    }
    
    // País correto: verificar slug
    if (leagueSlug) {
      const slugLower = leagueSlug.toLowerCase();
      if (domestic.slugs.some(s => slugLower === s.toLowerCase() || slugLower.includes(s.toLowerCase()))) {
        return true;
      }
    }
    
    // País correto: verificar nome
    if (league) {
      if (domestic.names.some(n => league === n || league.includes(n))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Filtrar apenas partidas de ligas principais
 */
function filterMajorLeagues(matches, debugMode = false) {
  const dropped = [];
  const kept = [];
  
  const filtered = matches.filter(match => {
    const isTop = isTopLeague(match);
    
    if (debugMode) {
      const sample = {
        country: match.country,
        league: match.league,
        leagueSlug: match.leagueSlug
      };
      
      if (isTop && kept.length < 10) {
        kept.push(sample);
      } else if (!isTop && dropped.length < 10) {
        dropped.push(sample);
      }
    }
    
    return isTop;
  });
  
  return { filtered, dropped, kept };
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
    
    // Filtrar apenas ligas principais (com amostras para debug)
    const { filtered, dropped, kept } = filterMajorLeagues(matches, debugMode);
    matches = filtered;
    const totalAfterFilter = matches.length;
    
    if (debugMode) {
      console.log(`📊 DEBUG: Total antes do filtro: ${totalBeforeFilter}`);
      console.log(`🎯 DEBUG: Total após filtro: ${totalAfterFilter}`);
      console.log(`❌ DEBUG: Dropped sample:`, dropped);
      console.log(`✅ DEBUG: Kept sample:`, kept);
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
        droppedSample: dropped,
        keptSample: kept
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
