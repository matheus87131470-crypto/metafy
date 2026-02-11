/**
 * API Route: /api/fixtures
 * Busca jogos organizados por liga
 * 
 * Query params:
 * - league: ID da liga (opcional)
 * - date: Data específica (YYYY-MM-DD)
 * - live: Se true, busca jogos ao vivo
 * - next: Quantidade de próximos jogos
 */

// Configuração de ligas prioritárias (inline para compatibilidade CommonJS)
const PRIORITY_LEAGUES = [
  { id: 71, name: 'Brasileirão Série A', country: 'Brazil', flag: '🇧🇷', priority: 1 },
  { id: 72, name: 'Brasileirão Série B', country: 'Brazil', flag: '🇧🇷', priority: 2 },
  { id: 73, name: 'Copa do Brasil', country: 'Brazil', flag: '🇧🇷', priority: 3 },
  { id: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 4 },
  { id: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸', priority: 5 },
  { id: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', priority: 6 },
  { id: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹', priority: 7 },
  { id: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷', priority: 8 },
  { id: 2, name: 'Champions League', country: 'Europe', flag: '🏆', priority: 9 },
  { id: 3, name: 'Europa League', country: 'Europe', flag: '🏆', priority: 10 },
  { id: 13, name: 'Libertadores', country: 'South America', flag: '🌎', priority: 11 }
];

function getLeagueConfig(leagueId) {
  return PRIORITY_LEAGUES.find(l => l.id === leagueId);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  
  if (!apiKey) {
    console.error('❌ API_FOOTBALL_KEY não configurada');
    return res.status(500).json({
      success: false,
      error: 'API key not configured'
    });
  }

  try {
    const { league, date, live, next = 50, country } = req.query;
    
    let fixtures = [];
    
    if (live === 'true') {
      // Buscar jogos ao vivo
      fixtures = await fetchLiveFixtures(apiKey, league);
    } else if (date) {
      // Buscar jogos por data
      fixtures = await fetchFixturesByDate(apiKey, date, league);
    } else if (league) {
      // Buscar jogos de uma liga específica
      fixtures = await fetchFixturesByLeague(apiKey, league, next);
    } else {
      // Buscar jogos de todas as ligas prioritárias
      fixtures = await fetchPriorityFixtures(apiKey, country);
    }

    // Organizar por liga
    const organizedFixtures = organizeByLeague(fixtures);

    return res.status(200).json({
      success: true,
      total: fixtures.length,
      fixtures: organizedFixtures,
      raw: fixtures
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Busca jogos ao vivo
 */
async function fetchLiveFixtures(apiKey, leagueId = null) {
  let url = 'https://v3.football.api-sports.io/fixtures?live=all';
  if (leagueId) url += `&league=${leagueId}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey }
  });

  const data = await response.json();
  return data.response || [];
}

/**
 * Busca jogos por data
 */
async function fetchFixturesByDate(apiKey, date, leagueId = null) {
  let url = `https://v3.football.api-sports.io/fixtures?date=${date}`;
  if (leagueId) url += `&league=${leagueId}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey }
  });

  const data = await response.json();
  return data.response || [];
}

/**
 * Busca jogos de uma liga específica
 */
async function fetchFixturesByLeague(apiKey, leagueId, limit = 50) {
  const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&next=${limit}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey }
  });

  const data = await response.json();
  return data.response || [];
}

/**
 * Busca jogos das ligas prioritárias
 */
async function fetchPriorityFixtures(apiKey, countryFilter = null) {
  const today = new Date().toISOString().split('T')[0];
  
  // Filtrar ligas por país se especificado
  let leagues = PRIORITY_LEAGUES;
  if (countryFilter) {
    leagues = leagues.filter(l => 
      l.country.toLowerCase() === countryFilter.toLowerCase() ||
      l.countryCode.toLowerCase() === countryFilter.toLowerCase()
    );
  }
  
  // Limitar a 5 ligas por vez para não estourar o rate limit
  const topLeagues = leagues.slice(0, 5);
  
  const promises = topLeagues.map(async (league) => {
    try {
      const url = `https://v3.football.api-sports.io/fixtures?league=${league.id}&date=${today}`;
      const response = await fetch(url, {
        headers: { 'x-apisports-key': apiKey }
      });
      const data = await response.json();
      return data.response || [];
    } catch {
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat();
}

/**
 * Organiza jogos por liga
 */
function organizeByLeague(fixtures) {
  const organized = {};

  fixtures.forEach(fixture => {
    const leagueId = fixture.league.id;
    const leagueName = fixture.league.name;
    const country = fixture.league.country;

    if (!organized[leagueId]) {
      const config = getLeagueConfig(leagueId);
      organized[leagueId] = {
        id: leagueId,
        name: leagueName,
        country: country,
        flag: config?.flag || '🏆',
        logo: fixture.league.logo,
        priority: config?.priority || 99,
        fixtures: []
      };
    }

    organized[leagueId].fixtures.push(formatFixture(fixture));
  });

  // Converter para array e ordenar por prioridade
  return Object.values(organized)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Formata fixture para o frontend
 */
function formatFixture(fixture) {
  const status = getFixtureStatus(fixture.fixture.status.short);
  
  return {
    id: fixture.fixture.id,
    date: fixture.fixture.date,
    timestamp: fixture.fixture.timestamp,
    venue: fixture.fixture.venue?.name || null,
    status: status,
    statusText: fixture.fixture.status.long,
    minute: fixture.fixture.status.elapsed,
    
    league: {
      id: fixture.league.id,
      name: fixture.league.name,
      country: fixture.league.country,
      logo: fixture.league.logo,
      round: fixture.league.round
    },
    
    homeTeam: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      winner: fixture.teams.home.winner
    },
    
    awayTeam: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      winner: fixture.teams.away.winner
    },
    
    goals: {
      home: fixture.goals.home,
      away: fixture.goals.away
    },
    
    score: {
      halftime: fixture.score.halftime,
      fulltime: fixture.score.fulltime,
      extratime: fixture.score.extratime,
      penalty: fixture.score.penalty
    }
  };
}

/**
 * Mapeia status da API para status interno
 */
function getFixtureStatus(apiStatus) {
  const statusMap = {
    'TBD': 'scheduled',
    'NS': 'scheduled',
    'PST': 'postponed',
    'CANC': 'cancelled',
    'ABD': 'abandoned',
    '1H': 'live',
    'HT': 'live',
    '2H': 'live',
    'ET': 'live',
    'P': 'live',
    'FT': 'finished',
    'AET': 'finished',
    'PEN': 'finished',
    'BT': 'break',
    'SUSP': 'suspended',
    'INT': 'interrupted',
    'LIVE': 'live'
  };
  
  return statusMap[apiStatus] || 'unknown';
}
