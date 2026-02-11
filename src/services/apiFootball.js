/**
 * API-Football Service
 * Centraliza todas as chamadas para a API de futebol
 * 
 * @see https://www.api-football.com/documentation-v3
 */

const API_BASE_URL = 'https://v3.football.api-sports.io';

/**
 * Faz requisição para a API-Football
 * @param {string} endpoint - Endpoint da API
 * @param {Object} params - Parâmetros da query
 * @returns {Promise<Object>} Resposta da API
 */
async function apiRequest(endpoint, params = {}) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY não configurada');
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;

  console.log(`📡 API Request: ${endpoint}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-apisports-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API Errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

// ==========================================
// PAÍSES
// ==========================================

/**
 * Busca todos os países disponíveis
 * @returns {Promise<Array>} Lista de países
 */
export async function getCountries() {
  const data = await apiRequest('/countries');
  return data.response || [];
}

/**
 * Busca país por nome
 * @param {string} name - Nome do país
 * @returns {Promise<Object|null>} País encontrado
 */
export async function getCountryByName(name) {
  const data = await apiRequest('/countries', { name });
  return data.response?.[0] || null;
}

// ==========================================
// LIGAS E CAMPEONATOS
// ==========================================

/**
 * Busca todas as ligas
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Array>} Lista de ligas
 */
export async function getLeagues(params = {}) {
  const data = await apiRequest('/leagues', params);
  return data.response || [];
}

/**
 * Busca ligas por país
 * @param {string} country - Nome do país
 * @param {number} season - Temporada (opcional)
 * @returns {Promise<Array>} Lista de ligas do país
 */
export async function getLeaguesByCountry(country, season = null) {
  const params = { country };
  if (season) params.season = season;
  
  const data = await apiRequest('/leagues', params);
  return data.response || [];
}

/**
 * Busca liga por ID
 * @param {number} leagueId - ID da liga
 * @returns {Promise<Object|null>} Liga encontrada
 */
export async function getLeagueById(leagueId) {
  const data = await apiRequest('/leagues', { id: leagueId });
  return data.response?.[0] || null;
}

/**
 * Busca temporadas disponíveis
 * @returns {Promise<Array>} Lista de temporadas
 */
export async function getSeasons() {
  const data = await apiRequest('/leagues/seasons');
  return data.response || [];
}

// ==========================================
// JOGOS (FIXTURES)
// ==========================================

/**
 * Busca jogos por liga
 * @param {number} leagueId - ID da liga
 * @param {number} season - Temporada
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Array>} Lista de jogos
 */
export async function getFixturesByLeague(leagueId, season = 2025, options = {}) {
  const params = {
    league: leagueId,
    season,
    ...options
  };
  
  const data = await apiRequest('/fixtures', params);
  return data.response || [];
}

/**
 * Busca jogos de hoje
 * @param {number} leagueId - ID da liga (opcional)
 * @returns {Promise<Array>} Lista de jogos de hoje
 */
export async function getFixturesToday(leagueId = null) {
  const today = new Date().toISOString().split('T')[0];
  const params = { date: today };
  
  if (leagueId) params.league = leagueId;
  
  const data = await apiRequest('/fixtures', params);
  return data.response || [];
}

/**
 * Busca jogos ao vivo
 * @param {number} leagueId - ID da liga (opcional)
 * @returns {Promise<Array>} Lista de jogos ao vivo
 */
export async function getFixturesLive(leagueId = null) {
  const params = { live: 'all' };
  
  if (leagueId) params.league = leagueId;
  
  const data = await apiRequest('/fixtures', params);
  return data.response || [];
}

/**
 * Busca próximos jogos
 * @param {number} count - Quantidade de jogos
 * @param {number} leagueId - ID da liga (opcional)
 * @returns {Promise<Array>} Lista de próximos jogos
 */
export async function getFixturesNext(count = 10, leagueId = null) {
  const params = { next: count };
  
  if (leagueId) params.league = leagueId;
  
  const data = await apiRequest('/fixtures', params);
  return data.response || [];
}

/**
 * Busca jogo por ID
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Object|null>} Jogo encontrado
 */
export async function getFixtureById(fixtureId) {
  const data = await apiRequest('/fixtures', { id: fixtureId });
  return data.response?.[0] || null;
}

// ==========================================
// ESTATÍSTICAS
// ==========================================

/**
 * Busca estatísticas de um jogo
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Array>} Estatísticas do jogo
 */
export async function getFixtureStats(fixtureId) {
  const data = await apiRequest('/fixtures/statistics', { fixture: fixtureId });
  return data.response || [];
}

/**
 * Busca eventos de um jogo (gols, cartões, etc)
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Array>} Eventos do jogo
 */
export async function getFixtureEvents(fixtureId) {
  const data = await apiRequest('/fixtures/events', { fixture: fixtureId });
  return data.response || [];
}

/**
 * Busca lineups de um jogo
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Array>} Lineups do jogo
 */
export async function getFixtureLineups(fixtureId) {
  const data = await apiRequest('/fixtures/lineups', { fixture: fixtureId });
  return data.response || [];
}

// ==========================================
// ODDS
// ==========================================

/**
 * Busca odds de um jogo
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Array>} Odds do jogo
 */
export async function getOddsByFixture(fixtureId) {
  const data = await apiRequest('/odds', { fixture: fixtureId });
  return data.response || [];
}

/**
 * Busca odds ao vivo de um jogo
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Array>} Odds ao vivo
 */
export async function getOddsLive(fixtureId) {
  const data = await apiRequest('/odds/live', { fixture: fixtureId });
  return data.response || [];
}

// ==========================================
// HEAD TO HEAD
// ==========================================

/**
 * Busca confrontos diretos entre dois times
 * @param {number} team1Id - ID do time 1
 * @param {number} team2Id - ID do time 2
 * @param {number} last - Quantidade de jogos
 * @returns {Promise<Array>} Confrontos diretos
 */
export async function getHeadToHead(team1Id, team2Id, last = 10) {
  const data = await apiRequest('/fixtures/headtohead', {
    h2h: `${team1Id}-${team2Id}`,
    last
  });
  return data.response || [];
}

// ==========================================
// TIMES
// ==========================================

/**
 * Busca informações de um time
 * @param {number} teamId - ID do time
 * @returns {Promise<Object|null>} Informações do time
 */
export async function getTeamById(teamId) {
  const data = await apiRequest('/teams', { id: teamId });
  return data.response?.[0] || null;
}

/**
 * Busca estatísticas de um time em uma liga
 * @param {number} teamId - ID do time
 * @param {number} leagueId - ID da liga
 * @param {number} season - Temporada
 * @returns {Promise<Object|null>} Estatísticas do time
 */
export async function getTeamStats(teamId, leagueId, season = 2025) {
  const data = await apiRequest('/teams/statistics', {
    team: teamId,
    league: leagueId,
    season
  });
  return data.response || null;
}

// ==========================================
// PREVISÕES
// ==========================================

/**
 * Busca previsões de um jogo (da API)
 * @param {number} fixtureId - ID do jogo
 * @returns {Promise<Object|null>} Previsões do jogo
 */
export async function getPredictions(fixtureId) {
  const data = await apiRequest('/predictions', { fixture: fixtureId });
  return data.response?.[0] || null;
}

// ==========================================
// EXPORT DEFAULT
// ==========================================

export default {
  // Países
  getCountries,
  getCountryByName,
  
  // Ligas
  getLeagues,
  getLeaguesByCountry,
  getLeagueById,
  getSeasons,
  
  // Jogos
  getFixturesByLeague,
  getFixturesToday,
  getFixturesLive,
  getFixturesNext,
  getFixtureById,
  
  // Estatísticas
  getFixtureStats,
  getFixtureEvents,
  getFixtureLineups,
  
  // Odds
  getOddsByFixture,
  getOddsLive,
  
  // H2H
  getHeadToHead,
  
  // Times
  getTeamById,
  getTeamStats,
  
  // Previsões
  getPredictions
};
