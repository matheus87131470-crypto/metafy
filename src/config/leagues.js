/**
 * Configuração de Ligas Prioritárias
 * Ligas mais buscadas organizadas por país
 */

// IDs das ligas na API-Football
export const LEAGUE_IDS = {
  // Brasil
  BRASILEIRAO_A: 71,
  BRASILEIRAO_B: 72,
  COPA_DO_BRASIL: 73,
  
  // Inglaterra
  PREMIER_LEAGUE: 39,
  CHAMPIONSHIP: 40,
  FA_CUP: 45,
  LEAGUE_CUP: 48,
  
  // Espanha
  LA_LIGA: 140,
  LA_LIGA_2: 141,
  COPA_DEL_REY: 143,
  
  // Alemanha
  BUNDESLIGA: 78,
  BUNDESLIGA_2: 79,
  DFB_POKAL: 81,
  
  // Itália
  SERIE_A: 135,
  SERIE_B: 136,
  COPPA_ITALIA: 137,
  
  // França
  LIGUE_1: 61,
  LIGUE_2: 62,
  COUPE_DE_FRANCE: 66,
  
  // Portugal
  PRIMEIRA_LIGA: 94,
  
  // Holanda
  EREDIVISIE: 88,
  
  // Europa
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848,
  
  // Sul-Americana
  LIBERTADORES: 13,
  SULAMERICANA: 11,
  
  // Internacional
  WORLD_CUP: 1,
  EURO: 4,
  COPA_AMERICA: 9
};

// Configuração completa das ligas prioritárias
export const PRIORITY_LEAGUES = [
  // ==== BRASIL ====
  {
    id: LEAGUE_IDS.BRASILEIRAO_A,
    name: 'Brasileirão Série A',
    shortName: 'Série A',
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    logo: 'https://media.api-sports.io/football/leagues/71.png',
    priority: 1,
    category: 'national'
  },
  {
    id: LEAGUE_IDS.BRASILEIRAO_B,
    name: 'Brasileirão Série B',
    shortName: 'Série B',
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    logo: 'https://media.api-sports.io/football/leagues/72.png',
    priority: 2,
    category: 'national'
  },
  {
    id: LEAGUE_IDS.COPA_DO_BRASIL,
    name: 'Copa do Brasil',
    shortName: 'Copa BR',
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    logo: 'https://media.api-sports.io/football/leagues/73.png',
    priority: 3,
    category: 'cup'
  },
  
  // ==== INGLATERRA ====
  {
    id: LEAGUE_IDS.PREMIER_LEAGUE,
    name: 'Premier League',
    shortName: 'PL',
    country: 'England',
    countryCode: 'GB',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    priority: 1,
    category: 'national'
  },
  {
    id: LEAGUE_IDS.FA_CUP,
    name: 'FA Cup',
    shortName: 'FA Cup',
    country: 'England',
    countryCode: 'GB',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    logo: 'https://media.api-sports.io/football/leagues/45.png',
    priority: 2,
    category: 'cup'
  },
  
  // ==== ESPANHA ====
  {
    id: LEAGUE_IDS.LA_LIGA,
    name: 'La Liga',
    shortName: 'La Liga',
    country: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    priority: 1,
    category: 'national'
  },
  {
    id: LEAGUE_IDS.COPA_DEL_REY,
    name: 'Copa del Rey',
    shortName: 'Copa Rey',
    country: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    logo: 'https://media.api-sports.io/football/leagues/143.png',
    priority: 2,
    category: 'cup'
  },
  
  // ==== ALEMANHA ====
  {
    id: LEAGUE_IDS.BUNDESLIGA,
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    priority: 1,
    category: 'national'
  },
  
  // ==== ITÁLIA ====
  {
    id: LEAGUE_IDS.SERIE_A,
    name: 'Serie A',
    shortName: 'Serie A',
    country: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    priority: 1,
    category: 'national'
  },
  
  // ==== FRANÇA ====
  {
    id: LEAGUE_IDS.LIGUE_1,
    name: 'Ligue 1',
    shortName: 'Ligue 1',
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    priority: 1,
    category: 'national'
  },
  
  // ==== PORTUGAL ====
  {
    id: LEAGUE_IDS.PRIMEIRA_LIGA,
    name: 'Primeira Liga',
    shortName: 'Liga PT',
    country: 'Portugal',
    countryCode: 'PT',
    flag: '🇵🇹',
    logo: 'https://media.api-sports.io/football/leagues/94.png',
    priority: 1,
    category: 'national'
  },
  
  // ==== HOLANDA ====
  {
    id: LEAGUE_IDS.EREDIVISIE,
    name: 'Eredivisie',
    shortName: 'Eredivisie',
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    logo: 'https://media.api-sports.io/football/leagues/88.png',
    priority: 1,
    category: 'national'
  },
  
  // ==== COMPETIÇÕES EUROPEIAS ====
  {
    id: LEAGUE_IDS.CHAMPIONS_LEAGUE,
    name: 'UEFA Champions League',
    shortName: 'UCL',
    country: 'Europe',
    countryCode: 'EU',
    flag: '🇪🇺',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    priority: 1,
    category: 'european'
  },
  {
    id: LEAGUE_IDS.EUROPA_LEAGUE,
    name: 'UEFA Europa League',
    shortName: 'UEL',
    country: 'Europe',
    countryCode: 'EU',
    flag: '🇪🇺',
    logo: 'https://media.api-sports.io/football/leagues/3.png',
    priority: 2,
    category: 'european'
  },
  {
    id: LEAGUE_IDS.CONFERENCE_LEAGUE,
    name: 'UEFA Conference League',
    shortName: 'UECL',
    country: 'Europe',
    countryCode: 'EU',
    flag: '🇪🇺',
    logo: 'https://media.api-sports.io/football/leagues/848.png',
    priority: 3,
    category: 'european'
  },
  
  // ==== SUL-AMERICANA ====
  {
    id: LEAGUE_IDS.LIBERTADORES,
    name: 'Copa Libertadores',
    shortName: 'Libertadores',
    country: 'South America',
    countryCode: 'SA',
    flag: '🌎',
    logo: 'https://media.api-sports.io/football/leagues/13.png',
    priority: 1,
    category: 'continental'
  },
  {
    id: LEAGUE_IDS.SULAMERICANA,
    name: 'Copa Sul-Americana',
    shortName: 'Sul-Americana',
    country: 'South America',
    countryCode: 'SA',
    flag: '🌎',
    logo: 'https://media.api-sports.io/football/leagues/11.png',
    priority: 2,
    category: 'continental'
  }
];

// Países prioritários
export const PRIORITY_COUNTRIES = [
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', priority: 1 },
  { name: 'England', code: 'GB', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 2 },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', priority: 3 },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', priority: 4 },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', priority: 5 },
  { name: 'France', code: 'FR', flag: '🇫🇷', priority: 6 },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', priority: 7 },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', priority: 8 },
  { name: 'Europe', code: 'EU', flag: '🇪🇺', priority: 9 }
];

// Categorias de ligas
export const LEAGUE_CATEGORIES = {
  national: 'Campeonatos Nacionais',
  cup: 'Copas Nacionais',
  european: 'Competições Europeias',
  continental: 'Competições Sul-Americanas',
  international: 'Seleções'
};

// Funções auxiliares

/**
 * Busca liga por ID
 * @param {number} id - ID da liga
 * @returns {Object|null} Liga encontrada
 */
export function getLeagueConfig(id) {
  return PRIORITY_LEAGUES.find(l => l.id === id) || null;
}

/**
 * Busca ligas por país
 * @param {string} country - Nome do país
 * @returns {Array} Ligas do país
 */
export function getLeaguesByCountry(country) {
  return PRIORITY_LEAGUES
    .filter(l => l.country === country)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Busca ligas por categoria
 * @param {string} category - Categoria
 * @returns {Array} Ligas da categoria
 */
export function getLeaguesByCategory(category) {
  return PRIORITY_LEAGUES
    .filter(l => l.category === category)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Retorna IDs de todas as ligas prioritárias
 * @returns {Array<number>} Array de IDs
 */
export function getAllPriorityLeagueIds() {
  return PRIORITY_LEAGUES.map(l => l.id);
}

/**
 * Agrupa ligas por país
 * @returns {Object} Ligas agrupadas
 */
export function getLeaguesGroupedByCountry() {
  const grouped = {};
  
  PRIORITY_COUNTRIES.forEach(country => {
    const leagues = getLeaguesByCountry(country.name);
    if (leagues.length > 0) {
      grouped[country.name] = {
        ...country,
        leagues
      };
    }
  });
  
  return grouped;
}

export default {
  LEAGUE_IDS,
  PRIORITY_LEAGUES,
  PRIORITY_COUNTRIES,
  LEAGUE_CATEGORIES,
  getLeagueConfig,
  getLeaguesByCountry,
  getLeaguesByCategory,
  getAllPriorityLeagueIds,
  getLeaguesGroupedByCountry
};
