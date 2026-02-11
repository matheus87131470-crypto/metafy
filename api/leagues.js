/**
 * API Route: /api/leagues
 * Lista ligas disponíveis, organizadas por país
 * 
 * Query params:
 * - country: Filtrar por país
 * - priority: Se true, retorna apenas ligas prioritárias
 * - search: Busca por nome
 */

// Configuração inline para compatibilidade CommonJS
const PRIORITY_LEAGUES = [
  { id: 71, name: 'Brasileirão Série A', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', priority: 1 },
  { id: 72, name: 'Brasileirão Série B', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', priority: 2 },
  { id: 73, name: 'Copa do Brasil', country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', priority: 3 },
  { id: 39, name: 'Premier League', country: 'England', countryCode: 'GB', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 4 },
  { id: 45, name: 'FA Cup', country: 'England', countryCode: 'GB', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 5 },
  { id: 140, name: 'La Liga', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', priority: 6 },
  { id: 143, name: 'Copa del Rey', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', priority: 7 },
  { id: 78, name: 'Bundesliga', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', priority: 8 },
  { id: 135, name: 'Serie A', country: 'Italy', countryCode: 'IT', flag: '🇮🇹', priority: 9 },
  { id: 61, name: 'Ligue 1', country: 'France', countryCode: 'FR', flag: '🇫🇷', priority: 10 },
  { id: 94, name: 'Primeira Liga', country: 'Portugal', countryCode: 'PT', flag: '🇵🇹', priority: 11 },
  { id: 2, name: 'Champions League', country: 'Europe', countryCode: 'EU', flag: '🏆', priority: 12 },
  { id: 3, name: 'Europa League', country: 'Europe', countryCode: 'EU', flag: '🏆', priority: 13 },
  { id: 848, name: 'Conference League', country: 'Europe', countryCode: 'EU', flag: '🏆', priority: 14 },
  { id: 13, name: 'Libertadores', country: 'South America', countryCode: 'SA', flag: '🌎', priority: 15 },
  { id: 11, name: 'Sul-Americana', country: 'South America', countryCode: 'SA', flag: '🌎', priority: 16 }
];

const PRIORITY_COUNTRIES = [
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'GB', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'EU', name: 'Europe', flag: '🇪🇺' },
  { code: 'SA', name: 'South America', flag: '🌎' }
];

function getLeaguesByCountry(countryCode) {
  return PRIORITY_LEAGUES.filter(l => l.countryCode === countryCode || l.country === countryCode);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { country, priority, search } = req.query;

    // Se pedir apenas as prioritárias, retornar do config
    if (priority === 'true') {
      let leagues = PRIORITY_LEAGUES;

      // Filtrar por país
      if (country) {
        leagues = getLeaguesByCountry(country);
      }

      // Buscar por nome
      if (search) {
        const searchLower = search.toLowerCase();
        leagues = leagues.filter(l => 
          l.name.toLowerCase().includes(searchLower) ||
          l.country.toLowerCase().includes(searchLower)
        );
      }

      // Organizar por país
      const organized = organizeLeaguesByCountry(leagues);

      return res.status(200).json({
        success: true,
        total: leagues.length,
        countries: PRIORITY_COUNTRIES,
        leagues: leagues,
        byCountry: organized
      });
    }

    // Buscar todas as ligas da API
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    if (!apiKey) {
      // Fallback para ligas prioritárias
      return res.status(200).json({
        success: true,
        source: 'config',
        total: PRIORITY_LEAGUES.length,
        countries: PRIORITY_COUNTRIES,
        leagues: PRIORITY_LEAGUES,
        byCountry: organizeLeaguesByCountry(PRIORITY_LEAGUES)
      });
    }

    const leagues = await fetchLeagues(apiKey, country, search);
    const organized = organizeLeaguesByCountry(leagues);

    return res.status(200).json({
      success: true,
      source: 'api',
      total: leagues.length,
      countries: extractCountries(leagues),
      leagues: leagues,
      byCountry: organized
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback para config
    return res.status(200).json({
      success: true,
      source: 'fallback',
      total: PRIORITY_LEAGUES.length,
      countries: PRIORITY_COUNTRIES,
      leagues: PRIORITY_LEAGUES,
      byCountry: organizeLeaguesByCountry(PRIORITY_LEAGUES)
    });
  }
}

/**
 * Busca ligas da API-Football
 */
async function fetchLeagues(apiKey, country = null, search = null) {
  let url = 'https://v3.football.api-sports.io/leagues?current=true';
  
  if (country) {
    url += `&country=${encodeURIComponent(country)}`;
  }
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey }
  });

  const data = await response.json();
  
  if (!data.response) return [];

  // Formatar e filtrar
  return data.response
    .filter(item => item.league.type === 'League' || item.league.type === 'Cup')
    .map(item => formatLeague(item))
    .sort((a, b) => {
      // Priorizar ligas conhecidas
      const priorityA = getPriorityScore(a.id);
      const priorityB = getPriorityScore(b.id);
      return priorityA - priorityB;
    });
}

/**
 * Formata liga da API
 */
function formatLeague(item) {
  const priorityConfig = PRIORITY_LEAGUES.find(l => l.id === item.league.id);
  
  return {
    id: item.league.id,
    name: item.league.name,
    type: item.league.type,
    logo: item.league.logo,
    country: item.country.name,
    countryCode: item.country.code || '',
    countryFlag: item.country.flag || '',
    flag: priorityConfig?.flag || getCountryFlag(item.country.name),
    priority: priorityConfig?.priority || 99,
    isPriority: !!priorityConfig,
    season: item.seasons?.[0]?.year || 2025
  };
}

/**
 * Retorna score de prioridade
 */
function getPriorityScore(leagueId) {
  const config = PRIORITY_LEAGUES.find(l => l.id === leagueId);
  return config?.priority || 99;
}

/**
 * Organiza ligas por país
 */
function organizeLeaguesByCountry(leagues) {
  const organized = {};

  leagues.forEach(league => {
    const country = league.country;
    
    if (!organized[country]) {
      organized[country] = {
        name: country,
        flag: league.flag || league.countryFlag || getCountryFlag(country),
        leagues: []
      };
    }

    organized[country].leagues.push(league);
  });

  // Ordenar ligas dentro de cada país por prioridade
  Object.values(organized).forEach(country => {
    country.leagues.sort((a, b) => a.priority - b.priority);
  });

  return organized;
}

/**
 * Extrai países únicos
 */
function extractCountries(leagues) {
  const countries = new Map();
  
  leagues.forEach(league => {
    if (!countries.has(league.country)) {
      countries.set(league.country, {
        name: league.country,
        code: league.countryCode,
        flag: league.countryFlag || getCountryFlag(league.country)
      });
    }
  });

  return Array.from(countries.values());
}

/**
 * Retorna emoji de bandeira por país
 */
function getCountryFlag(country) {
  const flags = {
    'Brazil': '🇧🇷',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'Portugal': '🇵🇹',
    'Netherlands': '🇳🇱',
    'Argentina': '🇦🇷',
    'Belgium': '🇧🇪',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'World': '🌍',
    'Europe': '🇪🇺'
  };

  return flags[country] || '🏳️';
}
