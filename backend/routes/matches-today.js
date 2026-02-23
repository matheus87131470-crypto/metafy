/**
 * routes/matches-today.js
 * Fonte primária: API-Football (api-sports.io)
 * Fallback:       data/daily-games.json
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { calculateValue } from '../services/value-calculator.js';
import { leagueTier } from '../config/topLeagues.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Cache em memória (15 min) ──────────────────────────────────────────
const CACHE_TTL = 15 * 60 * 1000;
let _cache = { ts: 0, body: null };

// ── Status da API-Football → grupo interno ─────────────────────────────
const STATUS_GROUP = {
  NS:   'upcoming',
  TBD:  'upcoming',
  '1H': 'live',  HT:  'live',  '2H': 'live',
  ET:   'live',  P:   'live',  BT:   'live',
  FT:   'finished', AET: 'finished', PEN: 'finished',
  AWD:  'finished', WO:  'finished',
};
// PST / CANC / ABD / SUSP / INT → undefined → ignorar

// ── Data "hoje no Brasil" em YYYY-MM-DD (UTC-3) ────────────────────────
function brtDateStr(date = new Date()) {
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-'); // dd/mm/yyyy → yyyy-mm-dd
}

// ── Busca fixtures de uma data na API-Football ─────────────────────────
async function fetchFixtures(dateStr, apiKey) {
  const url = `https://v3.football.api-sports.io/fixtures?date=${dateStr}`;
  const r   = await fetch(url, {
    headers: { 'x-apisports-key': apiKey, 'Accept': 'application/json' },
  });
  if (!r.ok) throw new Error(`API-Football ${r.status} para ${dateStr}`);
  const payload = await r.json();
  if (payload.errors && Object.keys(payload.errors).length > 0)
    throw new Error(`API-Football erro: ${Object.values(payload.errors).join('; ')}`);
  return payload.response || [];
}

// ── Mapeia um fixture da API-Football para o formato interno ─────────
function mapFixture(f, todayBRT) {
  const fix    = f.fixture;
  const status = fix.status?.short || 'NS';
  const grp    = STATUS_GROUP[status];
  if (!grp) return null; // ignorar PST/CANC/etc.

  // Verificar se o "dia BRT" do jogo é hoje
  const kickoffDate  = new Date(fix.date);
  const kickoffBRT   = kickoffDate.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-');
  if (kickoffBRT !== todayBRT) return null;

  const timeBRT = kickoffDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  const home = f.teams?.home?.name || '?';
  const away = f.teams?.away?.name || '?';

  // Odds sintéticas neutras para value-calculator (sem odds reais na /fixtures)
  // → garante que calculateValue não crasha; values reais viriam de /odds
  const odds = { home: 2.5, draw: 3.20, away: 2.80 };

  const game = {
    id:      fix.id,
    league:  f.league?.name   || 'Liga',
    country: f.league?.country || '',
    home,
    away,
    kickoff: fix.date,
    odds,
    // stats ausentes → calculateValue usa fallback por odds puras
  };

  const valueAnalysis = calculateValue(game);

  return {
    ...game,
    timeBRT,
    statusGroup: grp,
    statusShort: status,
    goals: { home: f.goals?.home ?? null, away: f.goals?.away ?? null },
    leagueLogo: f.league?.logo  || '',
    homeLogo:   f.teams?.home?.logo || '',
    awayLogo:   f.teams?.away?.logo || '',
    valueAnalysis,
    source: 'api-football',
  };
}

// ── Carrega fallback (daily-games.json) ────────────────────────────────
function loadFallback() {
  try {
    const raw  = readFileSync(join(__dirname, '../data/daily-games.json'), 'utf-8');
    const data = JSON.parse(raw);
    return data.matches || [];
  } catch { return []; }
}

// ── Monta resposta final: live → upcoming → finished, top 10 ──────────
function buildResponse(allGames, todayBRT, source) {
  const byEdge    = (a, b) => (b.valueAnalysis?.edge ?? 0) - (a.valueAnalysis?.edge ?? 0);
  const live      = allGames.filter(m => m.statusGroup === 'live')
                             .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  const upcoming  = allGames.filter(m => m.statusGroup === 'upcoming').sort(byEdge);
  const finished  = allGames.filter(m => m.statusGroup === 'finished').sort(byEdge);
  const topGames  = [...live, ...upcoming, ...finished].slice(0, 10);

  console.log(`✅ [${source}] ${live.length} ao vivo | ${upcoming.length} próximos | ${finished.length} encerrados → retornando ${topGames.length}`);

  return {
    success: true,
    count:   topGames.length,
    date:    todayBRT,
    source,
    groups:  { live: live.length, upcoming: upcoming.length, finished: finished.length },
    matches: topGames,
  };
}

// ── Handler principal ──────────────────────────────────────────────────
const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const todayBRT = brtDateStr();

    // Cache hit
    if (_cache.body && (Date.now() - _cache.ts) < CACHE_TTL) {
      console.log('📦 /api/matches/today cache hit');
      return res.status(200).json(_cache.body);
    }

    const API_KEY = process.env.API_FOOTBALL_KEY;

    if (!API_KEY) {
      console.warn('⚠️  API_FOOTBALL_KEY não configurado — usando fallback');
      throw new Error('no_api_key');
    }

    console.log(`🌐 Buscando fixtures da API-Football para BRT ${todayBRT}...`);

    // Buscar hoje e amanhã UTC (para capturar jogos BRT que cruzam meia-noite UTC)
    const tomorrowBRT = brtDateStr(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const datesToFetch = Array.from(new Set([todayBRT, tomorrowBRT]));

    const allFixtures = (
      await Promise.all(datesToFetch.map(d => fetchFixtures(d, API_KEY)))
    ).flat();

    console.log(`📡 ${allFixtures.length} fixtures recebidos, filtrando por BRT=${todayBRT}...`);

    // ── Log diagnóstico: todas as ligas do dia (útil para calibrar topLeagues.js) ──
    const leagueMap = new Map();
    allFixtures.forEach(f => {
      const id = f.league?.id;
      if (id && !leagueMap.has(id)) leagueMap.set(id, `${f.league.name} (${f.league.country})`);
    });
    const sortedLeagues = [...leagueMap.entries()].sort((a, b) => a[0] - b[0]);
    console.log('[LIGAS DO DIA]', sortedLeagues.map(([id, name]) => `${id}:${name}`).join(' | '));

    // ── Mapear fixtures válidos pelo dia BRT ──────────────────────────────────
    const allMapped = allFixtures.map(f => {
      const t = leagueTier(f.league?.country, f.league?.name);
      if (!t) return null;                  // liga fora da curadoria — ignorar
      const mapped = mapFixture(f, todayBRT);
      if (!mapped) return null;
      return { ...mapped, leagueTier: t };
    }).filter(Boolean);

    // ── Curadoria: tier-1 primeiro; se < 10 completar com tier-2 ─────────────
    const tier1 = allMapped.filter(g => g.leagueTier === 1);
    const tier2 = allMapped.filter(g => g.leagueTier === 2);
    const needed = Math.max(0, 10 - tier1.length);
    const games  = [...tier1, ...tier2.slice(0, needed)];

    console.log(`🎯 Curadoria: ${tier1.length} tier-1 + ${Math.min(needed, tier2.length)} tier-2 = ${games.length} jogos selecionados (de ${allMapped.length} mapeados)`);

    const body = buildResponse(games, todayBRT, 'api-football');
    _cache = { ts: Date.now(), body };
    return res.status(200).json(body);

  } catch (err) {
    console.error('⚠️  API-Football falhou, usando fallback:', err.message);

    const todayBRT  = brtDateStr();
    const fallbacks = loadFallback();

    // Enriquecer fallback com timeBRT + statusGroup (time-based) + valueAnalysis
    const LIVE_MS = 115 * 60 * 1000;
    const now     = Date.now();
    const games   = fallbacks.map(g => {
      const ms  = new Date(g.kickoff).getTime();
      const sg  = ms > now ? 'upcoming' : (now - ms <= LIVE_MS ? 'live' : 'finished');
      const tBRT = new Date(g.kickoff).toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
      });
      return { ...g, timeBRT: tBRT, statusGroup: sg, source: 'fallback',
               valueAnalysis: calculateValue(g) };
    });

    const body = buildResponse(games, todayBRT, 'fallback');
    return res.status(200).json(body);
  }
};

export default handler;
