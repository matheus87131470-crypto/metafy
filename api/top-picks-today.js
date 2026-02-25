/**
 * api/top-picks-today.js  Vercel serverless function
 * Fornece dados para a aba Odds Altas sem depender do Render Backend.
 * Cada pick deve ter os campos exactos esperados pelo frontend:
 *   id, home, away, league, time, odds{home,draw,away},
 *   bestPick, bestPickLabel, confidencePct, rating, edge, iaFree
 */

const RENDER_URL = 'https://metafy-backend.onrender.com/api/top-picks/today';
const TIMEOUT_MS = 5000;

// Constroi hora formatada HH:MM a partir de hora e minuto
function t(h, m) {
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
}

function staticFallback() {
  const picks = [
    { id:'s1',  home:'Arsenal',          away:'Chelsea',          league:'PREMIER LEAGUE', time:t(16,30), odds:{home:2.10,draw:3.30,away:3.50}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:74.9, rating:'Forte',    edge:2.5,  iaFree:true  },
    { id:'s2',  home:'Real Madrid',      away:'Atletico Madrid',  league:'LA LIGA',        time:t(21, 0), odds:{home:2.05,draw:3.25,away:3.60}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:70.0, rating:'Forte',    edge:1.8,  iaFree:true  },
    { id:'s3',  home:'Paris SG',         away:'Olympique Lyon',   league:'LIGUE 1',        time:t(20,45), odds:{home:1.80,draw:3.50,away:4.20}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:72.1, rating:'Forte',    edge:2.1,  iaFree:false },
    { id:'s4',  home:'Inter Milan',      away:'Juventus',         league:'SERIE A',        time:t(20,45), odds:{home:2.55,draw:3.10,away:2.85}, bestPick:'draw', bestPickLabel:'Empate',       confidencePct:57.2, rating:'Leve',     edge:-0.7, iaFree:false },
    { id:'s5',  home:'B. Dortmund',      away:'Bayern Munich',    league:'BUNDESLIGA',     time:t(18,30), odds:{home:3.10,draw:3.25,away:2.35}, bestPick:'away', bestPickLabel:'Vitoria Fora', confidencePct:64.9, rating:'Moderada', edge:1.2,  iaFree:false },
    { id:'s6',  home:'Flamengo',         away:'Palmeiras',        league:'BRASILEIRAO',    time:t(20, 0), odds:{home:2.35,draw:3.10,away:3.05}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:60.5, rating:'Moderada', edge:1.0,  iaFree:false },
    { id:'s7',  home:'Boca Juniors',     away:'River Plate',      league:'LIGA PROF.',     time:t(21,30), odds:{home:2.55,draw:3.10,away:2.85}, bestPick:'draw', bestPickLabel:'Empate',       confidencePct:56.8, rating:'Leve',     edge:-0.5, iaFree:false },
    { id:'s8',  home:'Manchester City',  away:'Tottenham',        league:'PREMIER LEAGUE', time:t(15, 0), odds:{home:1.75,draw:3.80,away:4.50}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:78.0, rating:'Forte',    edge:3.1,  iaFree:false },
    { id:'s9',  home:'Barcelona',        away:'Valencia',         league:'LA LIGA',        time:t(19, 0), odds:{home:1.65,draw:3.80,away:5.50}, bestPick:'home', bestPickLabel:'Vitoria Casa', confidencePct:78.0, rating:'Forte',    edge:4.2,  iaFree:false },
    { id:'s10', home:'Napoli',           away:'Roma',             league:'SERIE A',        time:t(17, 0), odds:{home:2.10,draw:3.25,away:3.50}, bestPick:'away', bestPickLabel:'Vitoria Fora', confidencePct:62.3, rating:'Moderada', edge:1.5,  iaFree:false },
  ];
  return { success:true, picks, count:picks.length, source:'static-fallback' };
}

// Normaliza picks vindos do Render (formato diferente) para o formato do frontend
function normalizePicks(raw) {
  return raw.map((p, i) => {
    const va = p.valueAnalysis || {};
    const bp = va.bestMarket || p.bestPick || p.direction || 'home';
    const label = bp === 'home' ? 'Vitoria Casa' : bp === 'draw' ? 'Empate' : 'Vitoria Fora';
    return {
      id:            p.id || ('r' + i),
      home:          p.home || p.homeTeam || '?',
      away:          p.away || p.awayTeam || '?',
      league:        p.league || p.competition || '',
      time:          p.time || '--:--',
      odds:          p.odds || { home:2.10, draw:3.10, away:3.30 },
      bestPick:      bp,
      bestPickLabel: va.marketLabel || p.bestPickLabel || label,
      confidencePct: parseFloat(va.confidencePct || p.confidencePct || 60),
      rating:        va.rating || p.rating || 'Moderada',
      edge:          parseFloat(va.edge || p.edge || 0),
      iaFree:        i < 2,
    };
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=600'); // cache 10 min

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const resp  = await fetch(RENDER_URL, { signal: ctrl.signal });
    clearTimeout(timer);

    if (!resp.ok) throw new Error('Render ' + resp.status);
    const data = await resp.json();

    if (data.picks && data.picks.length > 0) {
      return res.status(200).json({ ...data, picks: normalizePicks(data.picks) });
    }
    throw new Error('picks vazios');
  } catch (err) {
    console.info('[top-picks-today] fallback:', err.message);
    return res.status(200).json(staticFallback());
  }
}