/**
 * games-service.js - Serviço de Jogos Reais com API-Football
 * Busca jogos reais de futebol do dia
 */

class GamesService {
  constructor() {
    // Usar API-Football (api-football-v3.p.rapidapi.com)
    this.apiKey = process.env.RAPIDAPI_KEY || 'YOUR_API_KEY_HERE';
    this.apiHost = 'api-football-v3.p.rapidapi.com';
    this.baseUrl = 'https://api-football-v3.p.rapidapi.com';
    
    // Cache de jogos (5 minutos)
    this.cacheGames = null;
    this.cacheTimestamp = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Busca jogos do dia usando API-Football
   */
  async getTodayGames() {
    // Verificar cache
    if (this.isCacheValid()) {
      return this.cacheGames;
    }

    try {
      const today = this.getDateString(new Date());
      
      const response = await fetch(
        `${this.baseUrl}/fixtures?date=${today}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': this.apiHost
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const games = this.parseGames(data);
      
      // Atualizar cache
      this.cacheGames = games;
      this.cacheTimestamp = Date.now();
      
      return games;
    } catch (error) {
      console.error('Erro ao buscar jogos reais:', error);
      return this.getFallbackGames();
    }
  }

  /**
   * Parsa dados da API para formato esperado
   */
  parseGames(apiData) {
    if (!apiData.response || apiData.response.length === 0) {
      return this.getFallbackGames();
    }

    return apiData.response.map(fixture => ({
      id: fixture.fixture.id,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      competition: fixture.league.name,
      country: fixture.league.country,
      date: fixture.fixture.date,
      time: this.formatTime(fixture.fixture.date),
      status: fixture.fixture.status.short,
      homeOdds: fixture.odds?.h2h?.[0] || 2.40,
      drawOdds: fixture.odds?.h2h?.[1] || 3.20,
      awayOdds: fixture.odds?.h2h?.[2] || 2.85,
      statistics: fixture.statistics || {}
    }));
  }

  /**
   * Jogos de fallback se API falhar
   */
  getFallbackGames() {
    return [
      {
        id: 1,
        homeTeam: 'Flamengo',
        awayTeam: 'Palmeiras',
        competition: 'Campeonato Brasileiro',
        country: 'Brazil',
        date: new Date().toISOString(),
        time: '20:00',
        status: 'NOT_STARTED',
        homeOdds: 2.40,
        drawOdds: 3.20,
        awayOdds: 2.85
      },
      {
        id: 2,
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        competition: 'La Liga',
        country: 'Spain',
        date: new Date().toISOString(),
        time: '21:00',
        status: 'NOT_STARTED',
        homeOdds: 1.85,
        drawOdds: 3.50,
        awayOdds: 3.80
      },
      {
        id: 3,
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        competition: 'Premier League',
        country: 'England',
        date: new Date().toISOString(),
        time: '15:30',
        status: 'NOT_STARTED',
        homeOdds: 1.55,
        drawOdds: 4.00,
        awayOdds: 5.20
      },
      {
        id: 4,
        homeTeam: 'PSG',
        awayTeam: 'Monaco',
        competition: 'Ligue 1',
        country: 'France',
        date: new Date().toISOString(),
        time: '18:00',
        status: 'NOT_STARTED',
        homeOdds: 1.45,
        drawOdds: 4.50,
        awayOdds: 6.50
      },
      {
        id: 5,
        homeTeam: 'Bayern Munich',
        awayTeam: 'Bayer Leverkusen',
        competition: 'Bundesliga',
        country: 'Germany',
        date: new Date().toISOString(),
        time: '19:30',
        status: 'NOT_STARTED',
        homeOdds: 1.70,
        drawOdds: 3.80,
        awayOdds: 4.50
      },
      {
        id: 6,
        homeTeam: 'Juventus',
        awayTeam: 'Inter Milan',
        competition: 'Serie A',
        country: 'Italy',
        date: new Date().toISOString(),
        time: '20:45',
        status: 'NOT_STARTED',
        homeOdds: 2.10,
        drawOdds: 3.40,
        awayOdds: 3.20
      }
    ];
  }

  /**
   * Verifica se cache é válido
   */
  isCacheValid() {
    if (!this.cacheGames || !this.cacheTimestamp) {
      return false;
    }
    return (Date.now() - this.cacheTimestamp) < this.cacheExpiry;
  }

  /**
   * Formata data para YYYY-MM-DD
   */
  getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formata hora do ISO string
   */
  formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Get um jogo específico por ID
   */
  async getGameById(id, games = null) {
    const allGames = games || await this.getTodayGames();
    return allGames.find(game => game.id === parseInt(id));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamesService;
}
