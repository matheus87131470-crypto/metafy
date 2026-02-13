/**
 * services/rapidapi-client.js
 * Cliente para RapidAPI SportAPI (API-Football)
 */

const axios = require('axios');

class RapidAPIClient {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY;
    this.apiHost = process.env.RAPIDAPI_HOST || 'api-football-v1.p.rapidapi.com';
    this.baseURL = `https://${this.apiHost}/v3`;
    
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

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        },
        timeout: 10000 // 10 segundos
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro RapidAPI:', error.message);
      
      if (error.response) {
        throw new Error(`RapidAPI error: ${error.response.status} - ${error.response.statusText}`);
      }
      
      throw error;
    }
  }

  /**
   * Buscar partidas de hoje
   */
  async getTodayMatches() {
    const today = new Date().toISOString().split('T')[0];
    
    const data = await this.request('/fixtures', {
      date: today,
      timezone: 'America/Sao_Paulo'
    });

    if (!data.response || data.response.length === 0) {
      return [];
    }

    // Transformar para formato simplificado
    return data.response.map(fixture => ({
      id: fixture.fixture.id,
      league: fixture.league.name,
      country: fixture.league.country,
      kickoff: fixture.fixture.date,
      home: fixture.teams.home.name,
      away: fixture.teams.away.name,
      odds: {
        home: fixture.odds?.values?.[0]?.odd || null,
        draw: fixture.odds?.values?.[1]?.odd || null,
        away: fixture.odds?.values?.[2]?.odd || null,
        over25: null, // Requer endpoint adicional
        btts: null
      },
      status: fixture.fixture.status.short,
      homeScore: fixture.goals?.home,
      awayScore: fixture.goals?.away
    }));
  }

  /**
   * Buscar detalhes de uma partida específica
   */
  async getMatchDetails(matchId) {
    const data = await this.request('/fixtures', {
      id: matchId
    });

    if (!data.response || data.response.length === 0) {
      throw new Error('Partida não encontrada');
    }

    const fixture = data.response[0];

    // Buscar odds separadamente
    let oddsData = null;
    try {
      const oddsResponse = await this.request('/odds', {
        fixture: matchId,
        bookmaker: 1 // Bet365
      });
      oddsData = oddsResponse.response?.[0];
    } catch (error) {
      console.warn('⚠️ Erro ao buscar odds:', error.message);
    }

    // Buscar estatísticas
    let statsData = null;
    try {
      const statsResponse = await this.request('/fixtures/statistics', {
        fixture: matchId
      });
      statsData = statsResponse.response;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar estatísticas:', error.message);
    }

    // Buscar H2H (últimos confrontos)
    let h2hData = [];
    try {
      const h2hResponse = await this.request('/fixtures/headtohead', {
        h2h: `${fixture.teams.home.id}-${fixture.teams.away.id}`,
        last: 5
      });
      h2hData = h2hResponse.response || [];
    } catch (error) {
      console.warn('⚠️ Erro ao buscar H2H:', error.message);
    }

    // Extrair odds
    const odds = {};
    if (oddsData?.bookmakers?.[0]?.bets) {
      const bets = oddsData.bookmakers[0].bets;
      
      // Match Winner
      const matchWinner = bets.find(b => b.name === 'Match Winner');
      if (matchWinner) {
        odds.home = matchWinner.values.find(v => v.value === 'Home')?.odd || null;
        odds.draw = matchWinner.values.find(v => v.value === 'Draw')?.odd || null;
        odds.away = matchWinner.values.find(v => v.value === 'Away')?.odd || null;
      }

      // Goals Over/Under
      const goalsOU = bets.find(b => b.name === 'Goals Over/Under');
      if (goalsOU) {
        const over25 = goalsOU.values.find(v => v.value === 'Over 2.5');
        const under25 = goalsOU.values.find(v => v.value === 'Under 2.5');
        odds.over25 = over25?.odd || null;
        odds.under25 = under25?.odd || null;
      }

      // Both Teams Score
      const btts = bets.find(b => b.name === 'Both Teams Score');
      if (btts) {
        odds.btts = btts.values.find(v => v.value === 'Yes')?.odd || null;
        odds.bttsNo = btts.values.find(v => v.value === 'No')?.odd || null;
      }
    }

    // Processar estatísticas
    const stats = {};
    if (statsData && statsData.length >= 2) {
      const homeStats = statsData[0].statistics;
      const awayStats = statsData[1].statistics;

      stats.shotsOnGoal = {
        home: homeStats.find(s => s.type === 'Shots on Goal')?.value || 0,
        away: awayStats.find(s => s.type === 'Shots on Goal')?.value || 0
      };
      stats.possession = {
        home: homeStats.find(s => s.type === 'Ball Possession')?.value || '50%',
        away: awayStats.find(s => s.type === 'Ball Possession')?.value || '50%'
      };
      stats.corners = {
        home: homeStats.find(s => s.type === 'Corner Kicks')?.value || 0,
        away: awayStats.find(s => s.type === 'Corner Kicks')?.value || 0
      };
    }

    return {
      id: fixture.fixture.id,
      league: fixture.league.name,
      country: fixture.league.country,
      kickoff: fixture.fixture.date,
      home: fixture.teams.home.name,
      away: fixture.teams.away.name,
      homeScore: fixture.goals?.home,
      awayScore: fixture.goals?.away,
      status: fixture.fixture.status.short,
      odds,
      stats,
      h2h: h2hData.map(h => ({
        date: h.fixture.date,
        home: h.teams.home.name,
        away: h.teams.away.name,
        scoreHome: h.goals.home,
        scoreAway: h.goals.away
      }))
    };
  }
}

module.exports = new RapidAPIClient();
