// Serviço de jogos - Origem única dos dados
// Quando a API real entrar, apenas altere este arquivo

import { MOCK_GAMES } from '../data/mockGames.js';

class GamesService {
  constructor() {
    this.useRealAPI = false; // Trocar para true quando API estiver aprovada
    this.apiEndpoint = '/api/games';
  }

  async getGames() {
    if (this.useRealAPI) {
      return await this.fetchFromAPI();
    }
    return this.getMockGames();
  }

  async fetchFromAPI() {
    try {
      const response = await fetch(this.apiEndpoint);
      const data = await response.json();
      
      if (data.success && data.games?.length > 0) {
        return {
          success: true,
          games: data.games,
          isDemo: false
        };
      }
      
      // Fallback para mock se API não retornar jogos
      console.warn('⚠️ API sem jogos, usando dados demo');
      return this.getMockGames();
      
    } catch (error) {
      console.error('❌ Erro na API:', error);
      return this.getMockGames();
    }
  }

  getMockGames() {
    // Simula delay de rede para parecer real
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          games: MOCK_GAMES,
          isDemo: true,
          message: 'Dados de demonstração'
        });
      }, 800);
    });
  }

  getGameById(id) {
    return MOCK_GAMES.find(g => g.id === id);
  }
}

// Singleton
export const gamesService = new GamesService();
