/**
 * games-service.js - Serviço de Jogos Reais com API Gratuita
 * Busca jogos reais de futebol do dia
 */

class GamesService {
  constructor() {
    // Usar API-SPORTS.io (gratuita) - 100 requests/dia
    this.apiKey = process.env.API_SPORTS_KEY || 'demo';
    this.baseUrl = 'https://v3.football.api-sports.io';
    
    // Cache de jogos (10 minutos)
    this.cacheGames = null;
    this.cacheTimestamp = null;
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutos
  }

  /**
   * Busca jogos do dia usando API-SPORTS
   */
  async getTodayGames() {
    // Verificar cache
    if (this.isCacheValid()) {
      console.log('📦 Retornando jogos do cache');
      return this.cacheGames;
    }

    try {
      const today = this.getDateString(new Date());
      console.log('🔄 Buscando jogos reais da API para:', today);
      
      const response = await fetch(
        `${this.baseUrl}/fixtures?date=${today}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        }
      );

      if (!response.ok) {
        console.error('❌ API retornou erro:', response.status);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 API response:', data.results, 'jogos encontrados');
      
      if (!data.response || data.response.length === 0) {
        console.warn('⚠️ Nenhum jogo encontrado para hoje');
        return [];
      }

      const games = this.parseGames(data);
      
      // Atualizar cache
      this.cacheGames = games;
      this.cacheTimestamp = Date.now();
      
      console.log('✅ Jogos processados:', games.length);
      return games;
    } catch (error) {
      console.error('❌ Erro ao buscar jogos reais:', error);
      return [];
    }
  }

  /**
   * Parsa dados da API para formato esperado
   */
  parseGames(apiData) {
    const games = apiData.response
      .filter(f => {
        // Filtrar apenas ligas importantes
        const importantLeagues = [39, 140, 78, 61, 135, 2, 3, 88]; // Premier, La Liga, Bundesliga, Ligue 1, Serie A, Champions, etc
        return importantLeagues.includes(f.league.id);
      })
      .slice(0, 10) // Máximo 10 jogos
      .map(fixture => {
        const statusMap = {
          'NS': 'HOJE',
          '1H': 'LIVE',
          '2H': 'LIVE',
          'HT': 'LIVE',
          'FT': 'FT',
          'PST': 'ADIADO'
        };

        return {
          id: fixture.fixture.id,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeFlag: this.getCountryFlag(fixture.league.country),
          awayFlag: this.getCountryFlag(fixture.league.country),
          competition: fixture.league.name,
          country: fixture.league.country,
          date: fixture.fixture.date,
          time: this.formatTime(fixture.fixture.date),
          status: statusMap[fixture.fixture.status.short] || 'HOJE',
          homeScore: fixture.goals.home,
          awayScore: fixture.goals.away,
          homeOdds: 2.40,
          drawOdds: 3.20,
          awayOdds: 2.85,
          stadium: fixture.fixture.venue?.name || ''
        };
      });

    return games;
  }

  /**
   * Retorna bandeira do país
   */
  getCountryFlag(country) {
    const flags = {
      'Brazil': '🇧🇷',
      'Spain': '🇪🇸',
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Portugal': '🇵🇹',
      'USA': '🇺🇸',
      'World': '🌍'
    };
    return flags[country] || '⚽';
  }
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
