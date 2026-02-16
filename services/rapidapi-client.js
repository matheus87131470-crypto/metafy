/**
 * services/rapidapi-client.js
 * Cliente para RapidAPI SportAPI7
 * 
 * IMPORTANTE: Configure as variáveis de ambiente:
 * - RAPIDAPI_KEY: Sua chave da RapidAPI
 * - RAPIDAPI_HOST: sportapi7.p.rapidapi.com
 * 
 * Documentação: https://rapidapi.com/sportapi/api/sportapi7
 */

const axios = require('axios');

// Cache em memória (60 segundos)
const cache = {
  today: { data: null, timestamp: null },
  live: { data: null, timestamp: null }
};
const CACHE_DURATION = 60000; // 60 segundos

class RapidAPIClient {
  constructor() {
    // Sanitização forte: garantir string limpa sem espaços ou caracteres inválidos
    this.apiKey = String(process.env.RAPIDAPI_KEY || '').replace(/\s+/g, '').trim();
    this.apiHost = String(process.env.RAPIDAPI_HOST || 'sportapi7.p.rapidapi.com').replace(/\s+/g, '').trim();
    this.baseURL = `https://${this.apiHost}/api/v1/sport/football`;
    
    console.log('🔧 SportAPI7 Client configurado:');
    console.log('   Host:', this.apiHost);
    console.log('   Base URL:', this.baseURL);
    console.log('   API Key:', this.apiKey ? '✅ Configurada' : '❌ Não configurada');
    
    if (!this.apiKey) {
      console.warn('⚠️ RAPIDAPI_KEY não configurada');
    }
  }

  /**
   * Fazer requisição para a API
   */
  async request(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('RAPIDAPI_KEY não configurada');
    }

    // Garantir que headers são strings simples (não arrays ou objetos)
    const rapidApiKey = String(this.apiKey).replace(/\s+/g, '').trim();
    const rapidApiHost = String(this.apiHost).replace(/\s+/g, '').trim();

    // Log detalhado da requisição
    const fullURL = `${this.baseURL}${endpoint}`;
    console.log('🔵 SportAPI7 Request:');
    console.log('   baseURL:', this.baseURL);
    console.log('   endpoint:', endpoint);
    console.log('   params:', JSON.stringify(params));
    console.log('   fullURL:', fullURL);

    try {
      const response = await axios.get(fullURL, {
        params,
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost
        },
        timeout: 15000 // 15 segundos
      });

      console.log('✅ SportAPI7 Response:', response.status, `(${response.data?.data?.length || 0} eventos)`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro SportAPI7:', error.message);
      console.error('   URL tentada:', fullURL);
      console.error('   Params:', JSON.stringify(params));
      
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   StatusText:', error.response.statusText);
        console.error('   Data:', JSON.stringify(error.response.data).substring(0, 500));
        throw new Error(`SportAPI7 error: ${error.response.status} - ${error.response.statusText}`);
      }
      
      throw error;
    }
  }

  /**
   * Buscar partidas agendadas para hoje
   * Endpoint: /api/v1/sport/football/scheduled-events/{date}
   */
  async getTodayMatches() {
    const now = Date.now();
    
    // Verificar cache
    if (cache.today.data && cache.today.timestamp && (now - cache.today.timestamp) < CACHE_DURATION) {
      console.log('✅ Retornando partidas de hoje do CACHE');
      return cache.today.data;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('🔄 Buscando partidas agendadas para:', today);
    
    const data = await this.request(`/scheduled-events/${today}`);

    if (!data?.data || data.data.length === 0) {
      console.log('⚠️ Nenhuma partida encontrada para hoje');
      return [];
    }

    // Transformar para formato simplificado
    const matches = data.data.map(event => ({
      id: event.id,
      league: event.tournament?.name || event.season?.name || 'N/A',
      country: event.tournament?.category?.name || 'N/A',
      kickoff: new Date(event.startTimestamp * 1000).toISOString(),
      home: event.homeTeam?.name || 'N/A',
      away: event.awayTeam?.name || 'N/A',
      status: event.status?.type || 'notstarted',
      homeScore: event.homeScore?.current || null,
      awayScore: event.awayScore?.current || null
    }));

    // Atualizar cache
    cache.today.data = matches;
    cache.today.timestamp = now;

    console.log(`✅ ${matches.length} partidas encontradas para hoje`);
    return matches;
  }

  /**
   * Buscar partidas ao vivo
   * Endpoint: /api/v1/sport/football/live-events
   */
  async getLiveMatches() {
    const now = Date.now();
    
    // Verificar cache
    if (cache.live.data && cache.live.timestamp && (now - cache.live.timestamp) < CACHE_DURATION) {
      console.log('✅ Retornando partidas ao vivo do CACHE');
      return cache.live.data;
    }

    console.log('🔄 Buscando partidas ao vivo...');
    
    const data = await this.request('/live-events');

    if (!data?.data || data.data.length === 0) {
      console.log('⚠️ Nenhuma partida ao vivo no momento');
      return [];
    }

    // Transformar para formato simplificado
    const matches = data.data.map(event => ({
      id: event.id,
      league: event.tournament?.name || event.season?.name || 'N/A',
      country: event.tournament?.category?.name || 'N/A',
      kickoff: new Date(event.startTimestamp * 1000).toISOString(),
      home: event.homeTeam?.name || 'N/A',
      away: event.awayTeam?.name || 'N/A',
      status: 'live',
      homeScore: event.homeScore?.current || 0,
      awayScore: event.awayScore?.current || 0,
      minute: event.time?.currentPeriodStartTimestamp ? Math.floor((Date.now() - event.time.currentPeriodStartTimestamp * 1000) / 60000) : null
    }));

    // Atualizar cache
    cache.live.data = matches;
    cache.live.timestamp = now;

    console.log(`✅ ${matches.length} partidas ao vivo`);
    return matches;
  }

  /**
   * Buscar detalhes de uma partida específica
   * Endpoint: /api/v1/sport/football/event/{id}/details
   */
  async getMatchDetails(matchId) {
    console.log(`🔄 Buscando detalhes da partida ${matchId}...`);
    
    const data = await this.request(`/event/${matchId}/details`);

    if (!data?.data) {
      throw new Error('Partida não encontrada');
    }

    const event = data.data;

    return {
      id: event.id,
      league: event.tournament?.name || 'N/A',
      country: event.tournament?.category?.name || 'N/A',
      kickoff: new Date(event.startTimestamp * 1000).toISOString(),
      home: event.homeTeam?.name || 'N/A',
      away: event.awayTeam?.name || 'N/A',
      homeScore: event.homeScore?.current || null,
      awayScore: event.awayScore?.current || null,
      status: event.status?.type || 'notstarted',
      odds: {},
      stats: {},
      h2h: []
    };
  }
}

module.exports = new RapidAPIClient();
