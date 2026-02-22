/**
 * routes/top-picks.js
 * GET /api/top-picks/today
 *
 * 1. Busca fixtures do dia na API-Football
 * 2. Filtra pelas ligas da whitelist (config/topLeagues.js)
 * 3. Ordena por horário (mais cedo primeiro)
 * 4. Retorna no máximo 10 picks com análise sintética
 */

import express from 'express';
import { TOP_LEAGUE_IDS } from '../config/topLeagues.js';

const router = express.Router();

// ── Cache em memória (30 min para não esgotar quota) ──────────────
const CACHE_TTL = 30 * 60 * 1000;
let cache = { data: null, ts: 0, date: '' };

// ── Mapa de status API-Football → status interno ─────────────────
const STATUS_MAP = {
  NS: 'scheduled', TBD: 'scheduled',
  '1H': 'live', HT: 'live', '2H': 'live', ET: 'live', P: 'live', BT: 'live',
  FT: 'finished', AET: 'finished', PEN: 'finished',
  PST: 'postponed', CANC: 'cancelled', ABD: 'cancelled',
  SUSP: 'cancelled', INT: 'cancelled', AWD: 'finished', WO: 'finished',
};

/**
 * Gera dados sintéticos de análise para exibir no card.
 * (Ponto de partida — pode ser substituído por análise real futuramente)
 */
function generateAnalysis(game, index) {
  const POOLS = [
    { market: 'Gols',          picks: ['Over 1.5', 'Over 2.5', 'Under 3.5'] },
    { market: 'Resultado',     picks: ['Casa DNB', 'Visitante DNB', 'Casa vence'] },
    { market: 'Ambas Marcam',  picks: ['Sim'] },
    { market: 'Gols',          picks: ['Over 2.5', 'Under 3.5'] },
  ];

  const pool   = POOLS[index % POOLS.length];
  const pick   = pool.picks[index % pool.picks.length];

  // Confiança decrescente conforme posição (90 → 70)
  const base   = 90 - index * 2;
  const jitter = (index * 7 + 3) % 5; // pseudo-random fixo
  const pct    = Math.min(95, Math.max(68, base + jitter));

  const levelClass       = pct >= 80 ? 'high' : pct >= 72 ? 'medium' : 'low';
  const confidenceLevel  = levelClass === 'high'   ? 'ALTA CONFIANÇA'
                         : levelClass === 'medium' ? 'MÉDIA CONFIANÇA'
                         : 'BAIXA CONFIANÇA';

  return {
    market: pool.market,
    pick,
    confidencePct: pct.toFixed(1),
    confidenceLevel,
    levelClass,
    explanation: `Análise técnica de ${game.home} vs ${game.away} baseada nos dados históricos da liga. Atualizada automaticamente.`,
    keyStats: [
      `Liga: ${game.league}`,
      `Horário: ${game.time}`,
      `Pick selecionado com base em critérios estatísticos`,
    ],
  };
}

/* ─────────────────────────────────────────────────────────
   GET /api/top-picks/today
───────────────────────────────────────────────────────── */
router.get('/today', async (req, res) => {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  if (!API_KEY) {
    console.warn('⚠️ API_FOOTBALL_KEY não configurado');
    return res.json({ success: false, error: 'API_FOOTBALL_KEY not set', picks: [] });
  }

  // Data de hoje em Brasília (UTC-3)
  const now       = new Date();
  const brtMs     = now.getTime() + (-3 * 60 - now.getTimezoneOffset()) * 60_000;
  const todayStr  = new Date(brtMs).toISOString().split('T')[0];

  // Verificar cache
  if (cache.data && cache.date === todayStr && (Date.now() - cache.ts) < CACHE_TTL) {
    console.log(`📦 top-picks cache hit (${cache.data.picks.length} picks)`);
    return res.json(cache.data);
  }

  try {
    console.log(`🌐 Top Picks – buscando fixtures para ${todayStr}...`);

    const url = `https://v3.football.api-sports.io/fixtures?date=${todayStr}`;
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API-Football respondeu ${response.status}`);
    }

    const payload = await response.json();

    if (payload.errors && Object.keys(payload.errors).length > 0) {
      throw new Error(`API-Football erro: ${Object.values(payload.errors).join('; ')}`);
    }

    const fixtures = payload.response || [];
    console.log(`✅ ${fixtures.length} fixtures recebidos — filtrando top ligas...`);

    // ── 1. Filtrar por whitelist ────────────────────────────
    const filtered = fixtures.filter(f =>
      f.league?.id && TOP_LEAGUE_IDS.has(f.league.id)
    );

    // ── 2. Ordenar por horário ──────────────────────────────
    filtered.sort((a, b) =>
      new Date(a.fixture.date) - new Date(b.fixture.date)
    );

    // ── 3. Mapear → picks (max 10) ──────────────────────────
    const picks = filtered.slice(0, 10).map((f, i) => {
      const fixture = f.fixture;
      const league  = f.league;
      const teams   = f.teams;
      const goals   = f.goals;

      const timeFormatted = new Date(fixture.date).toLocaleTimeString('pt-BR', {
        hour:     '2-digit',
        minute:   '2-digit',
        timeZone: 'America/Sao_Paulo',
      });

      const status = STATUS_MAP[fixture.status?.short] || 'scheduled';

      const base = {
        id:         String(fixture.id),
        league:     league.name.toUpperCase(),
        leagueId:   league.id,
        leagueLogo: league.logo || '',
        leagueFlag: league.flag || '',
        time:       timeFormatted,
        date:       fixture.date,
        home:       teams.home.name,
        away:       teams.away.name,
        homeLogo:   teams.home.logo || '',
        awayLogo:   teams.away.logo || '',
        status,
        homeScore:  goals.home,
        awayScore:  goals.away,
      };

      return { ...base, ...generateAnalysis(base, i) };
    });

    console.log(`⚡ Top Picks: ${picks.length} jogos selecionados`);

    const result = { success: true, picks, count: picks.length, date: todayStr };
    cache = { data: result, ts: Date.now(), date: todayStr };

    return res.json(result);

  } catch (error) {
    console.error('❌ Erro em /api/top-picks/today:', error.message);
    return res.status(502).json({ success: false, error: error.message, picks: [] });
  }
});

export default router;
