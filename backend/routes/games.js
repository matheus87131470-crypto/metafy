import express from "express";

const router = express.Router();

//  Cache em memória (30 min) 
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
let todayCache = { data: null, ts: 0, date: '' };

// Mapeamento de status da API-Football para termos internos
const STATUS_MAP = {
  NS: 'scheduled', TBD: 'scheduled',
  '1H': 'live', HT: 'live', '2H': 'live', ET: 'live', P: 'live', BT: 'live',
  FT: 'finished', AET: 'finished', PEN: 'finished',
  PST: 'postponed', CANC: 'cancelled', ABD: 'cancelled', SUSP: 'cancelled', INT: 'cancelled',
  AWD: 'finished', WO: 'finished'
};

/**
 * GET /api/games/today
 * Busca fixtures do dia na API-Football (api-sports.io).
 * Retorna array de jogos no formato que o frontend espera.
 */
router.get('/today', async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  if (!API_KEY) {
    console.warn(' API_FOOTBALL_KEY não configurado  retornando array vazio');
    return res.json({ success: false, error: 'API_FOOTBALL_KEY not set', games: [] });
  }

  // Data de hoje em YYYY-MM-DD (horário de Brasília, UTC-3)
  const now = new Date();
  const brtOffset = -3 * 60; // minutos
  const brtDate = new Date(now.getTime() + (brtOffset + now.getTimezoneOffset()) * 60000);
  const todayStr = brtDate.toISOString().split('T')[0];

  // Verificar cache
  if (todayCache.data && todayCache.date === todayStr && (Date.now() - todayCache.ts) < CACHE_TTL) {
    console.log(` Cache hit  ${todayCache.data.count} jogos`);
    return res.json(todayCache.data);
  }

  try {
    console.log(` Buscando fixtures para ${todayStr} na API-Football...`);

    const url = `https://v3.football.api-sports.io/fixtures?date=${todayStr}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API-Football respondeu ${response.status}`);
    }

    const payload = await response.json();

    if (payload.errors && Object.keys(payload.errors).length > 0) {
      const errMsg = Object.values(payload.errors).join('; ');
      throw new Error(`API-Football erro: ${errMsg}`);
    }

    const fixtures = payload.response || [];
    console.log(` ${fixtures.length} fixtures recebidos da API-Football`);

    const games = fixtures.map(f => {
      const fixture = f.fixture;
      const league  = f.league;
      const teams   = f.teams;
      const goals   = f.goals;

      // Hora local de Brasília
      const dateObj = new Date(fixture.date);
      const time = dateObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });

      const status = STATUS_MAP[fixture.status?.short] || 'scheduled';

      return {
        id:         fixture.id,
        homeTeam:   teams.home.name,
        awayTeam:   teams.away.name,
        competition: league.name,
        country:    league.country,
        leagueId:   league.id,
        time,
        date:       fixture.date,
        status,
        homeScore:  goals.home,
        awayScore:  goals.away,
        teams: {
          home: { name: teams.home.name, logo: teams.home.logo },
          away: { name: teams.away.name, logo: teams.away.logo }
        },
        league: {
          id:      league.id,
          name:    league.name,
          country: league.country,
          logo:    league.logo,
          flag:    league.flag
        },
        // Odds não fornecidas pelo endpoint de fixtures (plano gratuito)
        homeOdds: 0,
        drawOdds: 0,
        awayOdds: 0
      };
    });

    const result = {
      success: true,
      games,
      count:  games.length,
      date:   todayStr,
      source: 'api-football'
    };

    // Salvar cache
    todayCache = { data: result, ts: Date.now(), date: todayStr };

    return res.json(result);

  } catch (error) {
    console.error(' Erro ao buscar fixtures da API-Football:', error.message);
    return res.status(502).json({
      success: false,
      error: error.message,
      games: []
    });
  }
});

/**
 * GET /api/games
 * Mantido como fallback (dados estáticos verificados)
 */
router.get("/", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const fallbackGames = [
      {
        id: 1,
        homeTeam: 'Liverpool',        homeFlag: '',
        awayTeam: 'Manchester City',  awayFlag: '',
        competition: 'Premier League', country: ' England',
        time: '20:00', homeOdds: 2.75, drawOdds: 3.40, awayOdds: 2.55,
        status: 'scheduled', date: todayStr
      },
      {
        id: 2,
        homeTeam: 'Real Madrid',      homeFlag: '',
        awayTeam: 'Barcelona',        awayFlag: '',
        competition: 'La Liga',        country: ' Spain',
        time: '21:00', homeOdds: 1.95, drawOdds: 3.60, awayOdds: 3.90,
        status: 'scheduled', date: todayStr
      },
      {
        id: 3,
        homeTeam: 'Palmeiras',        homeFlag: '',
        awayTeam: 'Flamengo',         awayFlag: '',
        competition: 'Brasileirão',   country: ' Brazil',
        time: '19:00', homeOdds: 2.50, drawOdds: 3.30, awayOdds: 2.80,
        status: 'scheduled', date: todayStr
      }
    ];

    res.json({
      success: true,
      games: fallbackGames,
      count:  fallbackGames.length,
      source: 'fallback-static'
    });
  } catch (error) {
    console.error('Erro ao retornar fallback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
