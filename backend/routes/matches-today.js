/**
 * routes/matches-today.js — LÓGICA ESTÁVEL
 * GET /api/matches/today
 *
 * Retorna exatamente 10 jogos do dia (BRT), ou menos se não houver.
 *
 * CACHE DIÁRIO: o Top 10 é selecionado uma vez por dia (BRT) e fica fixo
 * o dia inteiro — igual seleção manual. Só muda quando vira o dia.
 *
 * SELEÇÃO (fixa, não muda mais):
 *   1. Importantes (whitelist por country+league) — NS → ao vivo → encerrados
 *   2. Completar até 10 com qualquer outro jogo do dia (mesma ordem)
 *
 * Resposta: { dateBRT, source, count, matches: [...] }
 * — lista única, sem divisão em grupos. Cada item carrega statusGroup para o frontend.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { calculateValue } from '../services/value-calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Cache diário fixo (reseta só quando muda o dia BRT) ───────────────────
let _cache = { dateBRT: null, body: null };

// ── statusGroup a partir do código da API ──────────────────────────────
const STATUS_GROUP_MAP = {
  NS: 'upcoming', TBD: 'upcoming',
  '1H': 'live', HT: 'live', '2H': 'live', ET: 'live', P: 'live', BT: 'live',
  FT: 'finished', AET: 'finished', PEN: 'finished', AWD: 'finished', WO: 'finished',
};
// PST / CANC / ABD / SUSP / INT → undefined → ignorar

// Ordem de exibição: NS primeiro, ao vivo depois, encerrados por último
const STATUS_ORDER = { upcoming: 0, live: 1, finished: 2 };

// ── Whitelist de ligas importantes (country + name, case-insensitive) ──
const norm = s => (s || '').toLowerCase().trim();

function isImportant(country, name) {
  const c = norm(country);
  const n = norm(name);
  // Brasil
  if (c === 'brazil' && (n === 'serie a' || n === 'copa do brasil')) return true;
  // UEFA / CONMEBOL
  if (n === 'uefa champions league')           return true;
  if (n === 'uefa europa league')              return true;
  if (n === 'uefa europa conference league')   return true;
  if (n === 'conmebol libertadores')           return true;
  if (n === 'conmebol sudamericana')           return true;
  // Big-5 europeus
  if (c === 'england' && n === 'premier league') return true;
  if (c === 'spain'   && n === 'la liga')        return true;
  if (c === 'italy'   && n === 'serie a')        return true;
  if (c === 'germany' && n === 'bundesliga')     return true;
  if (c === 'france'  && n === 'ligue 1')        return true;
  // Oriente Médio
  if (c === 'saudi arabia' && n.includes('pro league')) return true;
  return false;
}

// ── Data BRT em YYYY-MM-DD ─────────────────────────────────────────────
function brtDateStr(date = new Date()) {
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-');
}

// ── Busca fixtures na API-Football ─────────────────────────────────────
async function fetchFixtures(dateStr, apiKey) {
  const r = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`, {
    headers: { 'x-apisports-key': apiKey, 'Accept': 'application/json' },
  });
  if (!r.ok) throw new Error(`API-Football ${r.status}`);
  const payload = await r.json();
  if (payload.errors && Object.keys(payload.errors).length > 0)
    throw new Error(Object.values(payload.errors).join('; '));
  return payload.response || [];
}

// ── Mapeia fixture API → objeto interno ────────────────────────────────
function mapFixture(f, todayBRT) {
  const fix    = f.fixture;
  const status = fix.status?.short || 'NS';
  const grp    = STATUS_GROUP_MAP[status];
  if (!grp) return null; // ignorados: cancelados, adiados, etc.

  const kickoffDate = new Date(fix.date);
  const kickoffBRT  = kickoffDate.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-');
  if (kickoffBRT !== todayBRT) return null; // fora do dia BRT de hoje

  const timeBRT = kickoffDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  });

  const country = f.league?.country || '';
  const league  = f.league?.name    || '';

  const game = {
    id:      fix.id,
    league,
    country,
    home:    f.teams?.home?.name || '?',
    away:    f.teams?.away?.name || '?',
    kickoff: fix.date,
    odds:    { home: 2.5, draw: 3.20, away: 2.80 }, // sintéticas (sem odds na /fixtures)
  };

  return {
    ...game,
    timeBRT,
    statusGroup:  grp,
    statusShort:  status,
    important:    isImportant(country, league),
    goals:        { home: f.goals?.home ?? null, away: f.goals?.away ?? null },
    leagueLogo:   f.league?.logo          || '',
    homeLogo:     f.teams?.home?.logo     || '',
    awayLogo:     f.teams?.away?.logo     || '',
    valueAnalysis: calculateValue(game),
    source:       'api-football',
  };
}

// ── Ordena: NS → ao vivo → encerrados; dentro de cada grupo por horário ──
function sortGames(games) {
  return [...games].sort((a, b) => {
    const so = (STATUS_ORDER[a.statusGroup] ?? 9) - (STATUS_ORDER[b.statusGroup] ?? 9);
    if (so !== 0) return so;
    return new Date(a.kickoff) - new Date(b.kickoff);
  });
}

// ── Top 10: importantes primeiro, completar com outros ─────────────────
function pickTop10(games) {
  const important = sortGames(games.filter(g => g.important));
  const others    = sortGames(games.filter(g => !g.important));
  const top       = [...important, ...others].slice(0, 10);
  console.log(`🎯 top10: ${important.length} importantes + ${Math.max(0, top.length - important.length)} outros = ${top.length}`);
  return top;
}

// ── Fallback (daily-games.json) ────────────────────────────────────────
function buildFallback(todayBRT) {
  try {
    const raw  = readFileSync(join(__dirname, '../data/daily-games.json'), 'utf-8');
    const data = JSON.parse(raw);
    const LIVE_MS = 115 * 60 * 1000;
    const now     = Date.now();
    const games   = (data.matches || []).map(g => {
      const ms  = new Date(g.kickoff).getTime();
      const grp = ms > now ? 'upcoming' : (now - ms <= LIVE_MS ? 'live' : 'finished');
      return {
        ...g,
        timeBRT: new Date(g.kickoff).toLocaleTimeString('pt-BR', {
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
        }),
        statusGroup: grp,
        important: isImportant(g.country, g.league),
        valueAnalysis: calculateValue(g),
        source: 'fallback',
      };
    });
    return games;
  } catch { return []; }
}

// ── Handler ────────────────────────────────────────────────────────────
const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const todayBRT = brtDateStr();

    if (_cache.body && _cache.dateBRT === todayBRT) {
      console.log(`📦 /api/matches/today — cache diário hit (${todayBRT})`);
      return res.status(200).json(_cache.body);
    }

    const API_KEY = process.env.API_FOOTBALL_KEY;
    if (!API_KEY) throw new Error('no_api_key');

    console.log(`🌐 Buscando fixtures para BRT ${todayBRT}...`);

    // Busca hoje + amanhã UTC (cobre madrugada BRT)
    const tomorrowBRT  = brtDateStr(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const dates        = [...new Set([todayBRT, tomorrowBRT])];
    const allFixtures  = (await Promise.all(dates.map(d => fetchFixtures(d, API_KEY)))).flat();

    console.log(`📡 ${allFixtures.length} fixtures brutos recebidos`);

    // Log diagnóstico único: todas as ligas presentes hoje
    const leagueLog = new Map();
    allFixtures.forEach(f => {
      const id = f.league?.id;
      if (id && !leagueLog.has(id))
        leagueLog.set(id, `${f.league.name} | ${f.league.country}`);
    });
    console.log('[LIGAS DO DIA]',
      [...leagueLog.entries()].sort((a, b) => a[0] - b[0])
        .map(([id, val]) => `${id}:${val}`).join(' || ')
    );

    const games   = allFixtures.map(f => mapFixture(f, todayBRT)).filter(Boolean);
    const matches = pickTop10(games);

    const body = { success: true, dateBRT: todayBRT, source: 'api-football', count: matches.length, matches };
    _cache = { dateBRT: todayBRT, body };
    console.log(`💾 Top10 do dia ${todayBRT} salvo em cache (fixo até meia-noite BRT)`);
    return res.status(200).json(body);

  } catch (err) {
    console.error('⚠️  API-Football falhou, usando fallback:', err.message);
    const todayBRT = brtDateStr();
    const matches  = pickTop10(buildFallback(todayBRT));
    return res.status(200).json({ success: true, dateBRT: todayBRT, source: 'fallback', count: matches.length, matches });
  }
};

export default handler;
