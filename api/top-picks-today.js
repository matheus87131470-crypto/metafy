/**
 * api/top-picks-today.js -- Vercel serverless proxy
 * Tenta buscar do Render; se falhar usa fallback estatico com
 * distribuicao realista (Casa / Empate / Fora / Avoid).
 *
 * Campos por pick: id, home, away, league, time, odds{home,draw,away},
 *   bestPick, bestPickLabel, confidencePct, rating, edge, iaFree
 */

const RENDER_URL = 'https://metafy-backend.onrender.com/api/top-picks/today';
const TIMEOUT_MS = 5000;

function t(h, m) {
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
}

function staticFallback() {
  const picks = [
    // 1-3: Vitoria Casa (edge >= 2%)
    { id:'s1',  home:'Arsenal',         away:'Chelsea',         league:'PREMIER LEAGUE', time:t(16,30), odds:{home:1.85,draw:3.70,away:4.50}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:70.2, rating:'Forte',    edge:6.1,  iaFree:true  },
    { id:'s2',  home:'Real Madrid',     away:'Valencia',        league:'LA LIGA',        time:t(21, 0), odds:{home:1.70,draw:3.80,away:5.50}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:67.5, rating:'Moderada', edge:4.3,  iaFree:true  },
    { id:'s3',  home:'Flamengo',        away:'Gremio',          league:'BRASILEIRAO',    time:t(20, 0), odds:{home:1.95,draw:3.50,away:4.10}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:60.3, rating:'Moderada', edge:2.8,  iaFree:false },
    // 4-5: Vitoria Fora (edge >= 2%)
    { id:'s4',  home:'Besiktas',        away:'Fenerbahce',      league:'SUPER LIG',      time:t(19, 0), odds:{home:3.40,draw:3.30,away:2.10}, bestPick:'away', bestPickLabel:'Vitoria Fora', confidencePct:63.1, rating:'Moderada', edge:3.7,  iaFree:false },
    { id:'s5',  home:'Borussia Dortm.', away:'Bayern Munich',   league:'BUNDESLIGA',     time:t(18,30), odds:{home:4.20,draw:3.70,away:1.75}, bestPick:'away', bestPickLabel:'Vitoria Fora', confidencePct:71.8, rating:'Forte',    edge:7.2,  iaFree:false },
    // 6-7: Empate (edge >= 2%)
    { id:'s6',  home:'Inter Milan',     away:'Juventus',        league:'SERIE A',        time:t(20,45), odds:{home:2.80,draw:2.90,away:2.75}, bestPick:'draw', bestPickLabel:'Empate',       confidencePct:56.4, rating:'Leve',     edge:2.3,  iaFree:false },
    { id:'s7',  home:'Atletico Madrid', away:'Villarreal',      league:'LA LIGA',        time:t(17, 0), odds:{home:2.60,draw:2.95,away:2.90}, bestPick:'draw', bestPickLabel:'Empate',       confidencePct:57.1, rating:'Leve',     edge:2.1,  iaFree:false },
    // 8-10: Sem valor claro (avoid)
    { id:'s8',  home:'Manchester City', away:'Tottenham',       league:'PREMIER LEAGUE', time:t(15, 0), odds:{home:1.60,draw:4.10,away:6.00}, bestPick:'avoid', bestPickLabel:'Evitar',       confidencePct:0,    rating:'Sem valor claro', edge:0.8, iaFree:false },
    { id:'s9',  home:'Napoli',          away:'Roma',            league:'SERIE A',        time:t(13, 0), odds:{home:2.05,draw:3.40,away:3.60}, bestPick:'avoid', bestPickLabel:'Evitar',       confidencePct:0,    rating:'Sem valor claro', edge:1.4, iaFree:false },
    { id:'s10', home:'Boca Juniors',    away:'River Plate',     league:'LIGA PROF.',     time:t(21,30), odds:{home:2.50,draw:3.20,away:2.80}, bestPick:'avoid', bestPickLabel:'Evitar',       confidencePct:0,    rating:'Sem valor claro', edge:0.3, iaFree:false },
  ];
  return { success:true, picks, count:picks.length, source:'static-fallback' };
}

// Normaliza picks do Render para o formato do frontend
function normalizePicks(raw) {
  return raw.map(function(p, i) {
    var va = p.valueAnalysis || {};
    var bp = va.bestMarket || p.bestPick || p.direction || 'avoid';
    var label = bp === 'home' ? 'Vitoria Casa'
              : bp === 'draw' ? 'Empate'
              : bp === 'away' ? 'Vitoria Fora'
              : 'Evitar';
    var edge = parseFloat(va.edge || p.edge || 0);
    var isAvoid = bp === 'avoid' || edge < 2;
    return {
      id:            p.id || ('r' + i),
      home:          p.home || p.homeTeam || '?',
      away:          p.away || p.awayTeam || '?',
      league:        (p.league || p.competition || '').toUpperCase(),
      time:          p.time || '--:--',
      odds:          p.odds || { home:2.10, draw:3.10, away:3.30 },
      bestPick:      isAvoid ? 'avoid' : bp,
      bestPickLabel: isAvoid ? 'Evitar' : (va.marketLabel || p.bestPickLabel || label),
      confidencePct: isAvoid ? 0 : parseFloat(va.confidencePct || p.confidencePct || 60),
      rating:        isAvoid ? 'Sem valor claro' : (va.rating || p.rating || 'Leve'),
      edge:          edge,
      iaFree:        i < 2,
    };
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    var ctrl  = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, TIMEOUT_MS);
    var resp  = await fetch(RENDER_URL, { signal: ctrl.signal });
    clearTimeout(timer);

    if (!resp.ok) throw new Error('Render ' + resp.status);
    var data = await resp.json();

    if (data.picks && data.picks.length > 0) {
      return res.status(200).json({ success:true, picks: normalizePicks(data.picks), count: data.picks.length });
    }
    throw new Error('picks vazios');
  } catch (err) {
    console.info('[top-picks-today] fallback:', err.message);
    return res.status(200).json(staticFallback());
  }
}