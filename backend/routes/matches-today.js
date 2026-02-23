/**
 * routes/matches-today.js
 * Endpoint Express para retornar partidas de hoje
 * Lê dados locais de daily-games.json
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { calculateValue } from '../services/value-calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar dados locais
const gamesDataPath = join(__dirname, '../data/daily-games.json');
let gamesData = null;

function loadGamesData() {
  try {
    const rawData = readFileSync(gamesDataPath, 'utf-8');
    gamesData = JSON.parse(rawData);
    console.log('✅ Dados carregados:', gamesData.matches.length, 'jogos');
  } catch (error) {
    console.error('❌ Erro ao carregar daily-games.json:', error.message);
    gamesData = { date: new Date().toISOString().split('T')[0], matches: [] };
  }
}

// Carregar dados na inicialização
loadGamesData();

const handler = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 GET /api/matches/today - Scanner automático');

    const now            = new Date();
    const LIVE_WINDOW_MS  = 115 * 60 * 1000; // ~duração de uma partida

    // 1. Classificar TODOS os jogos: upcoming / live / finished
    const allProcessed = gamesData.matches.map(game => {
      const kickoffMs = new Date(game.kickoff).getTime();
      const diffMs    = now.getTime() - kickoffMs;

      const statusGroup = kickoffMs > now.getTime()  ? 'upcoming'
                        : diffMs <= LIVE_WINDOW_MS    ? 'live'
                        :                              'finished';

      const timeBRT = new Date(game.kickoff).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });

      const valueAnalysis = calculateValue(game);
      return { ...game, timeBRT, statusGroup, valueAnalysis };
    });

    // 2. Separar e ordenar cada grupo
    const byEdge   = (a, b) => (b.valueAnalysis.edge ?? 0) - (a.valueAnalysis.edge ?? 0);
    const live     = allProcessed.filter(m => m.statusGroup === 'live')
                                  .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    const upcoming = allProcessed.filter(m => m.statusGroup === 'upcoming').sort(byEdge);
    const finished = allProcessed.filter(m => m.statusGroup === 'finished').sort(byEdge);

    // 3. Top 10: ao vivo → próximos → encerrados
    const topGames = [...live, ...upcoming, ...finished].slice(0, 10);

    console.log(`✅ ${live.length} ao vivo | ${upcoming.length} próximos | ${finished.length} encerrados → top ${topGames.length}`);

    return res.status(200).json({
      success: true,
      count:   topGames.length,
      date:    gamesData.date,
      groups:  { live: live.length, upcoming: upcoming.length, finished: finished.length },
      matches: topGames,
    });
    
  } catch (error) {
    console.error('❌ Erro ao retornar partidas:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao retornar partidas',
      message: error.message
    });
  }
};

export default handler;
