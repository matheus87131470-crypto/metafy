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

import axios from 'axios';

// Cache em memória
const cache = {
  today: { data: null, timestamp: null },
  live: { data: null, timestamp: null }
};
const CACHE_DURATION_TODAY = 60000; // 60 segundos
const CACHE_DURATION_LIVE = 15000; // 15 segundos

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
      console.error('   Headers:', { 'X-RapidAPI-Key': '***', 'X-RapidAPI-Host': rapidApiHost });
      
      if (error.response) {
        console.error('   ❌ Response Status:', error.response.status);
        console.error('   ❌ Response StatusText:', error.response.statusText);
        console.error('   ❌ Response Headers:', JSON.stringify(error.response.headers));
        console.error('   ❌ Response Body:', JSON.stringify(error.response.data).substring(0, 1000));
        throw new Error(`SportAPI7 error: ${error.response.status} - ${error.response.statusText} - ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
      
      throw error;
    }
  }

  /**
   * Buscar partidas agendadas para hoje ou data específica
   * Endpoint: /api/v1/sport/football/scheduled-events/{date}
   * @param {string} customDate - Data no formato YYYY-MM-DD (opcional)
   */
  async getTodayMatches(customDate = null) {
    const now = Date.now();
    
    // Gerar ou usar data customizada
    const dateStr = customDate || new Date().toISOString().split('T')[0];
    console.log('📅 Data para busca:', dateStr);
    
    // Verificar cache (se não for data customizada)
    if (!customDate && cache.today.data && cache.today.timestamp && (now - cache.today.timestamp) < CACHE_DURATION_TODAY) {
      console.log('✅ Retornando partidas do CACHE');
      return cache.today.data;
    }

    console.log('🔄 Buscando partidas agendadas via SportAPI7...');
    console.log('🎯 Endpoint:', `/scheduled-events/${dateStr}`);
    
    const data = await this.request(`/scheduled-events/${dateStr}`);

    // Log da resposta raw para debug
    console.log('📦 Resposta SportAPI7 (raw):', JSON.stringify(data).substring(0, 300));
    console.log('🔑 Chaves da resposta:', Object.keys(data || {}));

    // Verificar diferentes possíveis estruturas de resposta
    let events = null;
    if (data?.data) {
      events = data.data;
      console.log('✅ Eventos encontrados em: data.data');
    } else if (data?.events) {
      events = data.events;
      console.log('✅ Eventos encontrados em: data.events');
    } else if (Array.isArray(data)) {
      events = data;
      console.log('✅ Resposta é array direto');
    }

    if (!events || events.length === 0) {
      console.log('⚠️ Nenhuma partida encontrada para', dateStr);
      console.log('⚠️ Estrutura da resposta:', JSON.stringify(data));
      return [];
    }

    console.log(`🎯 ${events.length} eventos retornados pela API`);

    // Transformar para formato simplificado (normalização completa)
    const matches = events.map(event => {
      // Kickoff: tentar startTimestamp primeiro, depois startDate
      let kickoff = null;
      if (event.startTimestamp) {
        kickoff = new Date(event.startTimestamp * 1000).toISOString();
      } else if (event.startDate) {
        kickoff = new Date(event.startDate).toISOString();
      }

      return {
        id: event.id,
        league: event.tournament?.name || event.season?.name || null,
        leagueSlug: event.tournament?.slug || event.season?.slug || null,
        country: event.tournament?.category?.name || event.category?.name || null,
        kickoff: kickoff,
        status: event.status?.type || event.status || 'unknown',
        home: event.homeTeam?.name || event.home?.name || null,
        away: event.awayTeam?.name || event.away?.name || null,
        homeScore: event.homeScore?.current ?? event.homeScore ?? null,
        awayScore: event.awayScore?.current ?? event.awayScore ?? null
      };
    });

    // Atualizar cache (somente se não for data customizada)
    if (!customDate) {
      cache.today.data = matches;
      cache.today.timestamp = now;
    }

    console.log(`✅ ${matches.length} partidas processadas e retornadas`);
    return matches;
  }

  /**
   * Buscar partidas ao vivo
   * Endpoint: /api/v1/sport/football/events/live
   */
  async getLiveMatches() {
    const now = Date.now();
    
    // Verificar cache (15s para live)
    if (cache.live.data && cache.live.timestamp && (now - cache.live.timestamp) < CACHE_DURATION_LIVE) {
      console.log('✅ Retornando partidas ao vivo do CACHE');
      return cache.live.data;
    }

    console.log('🔄 Buscando partidas ao vivo...');
    
    const data = await this.request('/events/live');

    if (!data?.data || data.data.length === 0) {
      console.log('⚠️ Nenhuma partida ao vivo no momento');
      return [];
    }

    // Transformar para formato simplificado (normalização completa)
    const matches = data.data.map(event => {
      let kickoff = null;
      if (event.startTimestamp) {
        kickoff = new Date(event.startTimestamp * 1000).toISOString();
      } else if (event.startDate) {
        kickoff = new Date(event.startDate).toISOString();
      }

      return {
        id: event.id,
        league: event.tournament?.name || event.season?.name || null,
        leagueSlug: event.tournament?.slug || event.season?.slug || null,
        country: event.tournament?.category?.name || event.category?.name || null,
        kickoff: kickoff,
        status: event.status?.type || event.status || 'live',
        home: event.homeTeam?.name || event.home?.name || null,
        away: event.awayTeam?.name || event.away?.name || null,
        homeScore: event.homeScore?.current ?? event.homeScore ?? 0,
        awayScore: event.awayScore?.current ?? event.awayScore ?? 0,
        minute: event.time?.currentPeriodStartTimestamp ? Math.floor((Date.now() - event.time.currentPeriodStartTimestamp * 1000) / 60000) : null
      };
    });

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

export default new RapidAPIClient();
