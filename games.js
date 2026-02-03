/**
 * games.js - Gerenciador de Jogos de Futebol
 * Dados mockados de partidas de futebol
 */

const GAMES_DATA = [
    {
        id: 1,
        homeTeam: 'Flamengo',
        awayTeam: 'Palmeiras',
        competition: 'Campeonato Brasileiro',
        time: '20:00',
        homeOdds: 2.40,
        drawOdds: 3.20,
        awayOdds: 2.85
    },
    {
        id: 2,
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        competition: 'La Liga',
        time: '21:00',
        homeOdds: 1.85,
        drawOdds: 3.50,
        awayOdds: 3.80
    },
    {
        id: 3,
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        competition: 'Premier League',
        time: '15:30',
        homeOdds: 1.55,
        drawOdds: 4.00,
        awayOdds: 5.20
    },
    {
        id: 4,
        homeTeam: 'São Paulo',
        awayTeam: 'Corinthians',
        competition: 'Campeonato Brasileiro',
        time: '19:00',
        homeOdds: 2.10,
        drawOdds: 3.40,
        awayOdds: 3.20
    },
    {
        id: 5,
        homeTeam: 'Liverpool',
        awayTeam: 'Manchester United',
        competition: 'Premier League',
        time: '14:00',
        homeOdds: 1.72,
        drawOdds: 3.80,
        awayOdds: 4.50
    },
    {
        id: 6,
        homeTeam: 'Grêmio',
        awayTeam: 'Internacional',
        competition: 'Campeonato Brasileiro',
        time: '18:30',
        homeOdds: 2.55,
        drawOdds: 3.10,
        awayOdds: 2.70
    }
];

class GamesManager {
    constructor() {
        this.games = GAMES_DATA;
    }

    getAllGames() {
        return this.games;
    }

    getGameById(id) {
        return this.games.find(game => game.id === id);
    }

    formatCompetition(competition) {
        const icons = {
            'Campeonato Brasileiro': '🇧🇷',
            'Copa do Brasil': '🏆',
            'La Liga': '🇪🇸',
            'Premier League': '🇬🇧'
        };
        return `${icons[competition] || '⚽'} ${competition}`;
    }
}
