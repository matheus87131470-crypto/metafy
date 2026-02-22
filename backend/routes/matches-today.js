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

    const now = new Date();

    // 1. Filtrar apenas jogos futuros (kickoff >= agora)
    const futureMatches = gamesData.matches.filter(g => new Date(g.kickoff) >= now);

    // 2. Processar: adicionar timeBRT (já convertido para America/Sao_Paulo)
    //    e calcular value analysis
    const matchesWithValue = futureMatches.map(game => {
      const timeBRT = new Date(game.kickoff).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });
      const valueAnalysis = calculateValue(game);
      return { ...game, timeBRT, valueAnalysis };
    });

    // 3. Ordenar por edge (maior para menor)
    matchesWithValue.sort((a, b) => b.valueAnalysis.edge - a.valueAnalysis.edge);

    // 4. Manter apenas os top 10
    const topGames = matchesWithValue.slice(0, 10);

    console.log(`✅ Scanner: ${gamesData.matches.length} total, ${futureMatches.length} futuros, retornando top ${topGames.length}`);
    
    // Retornar top 10 jogos ordenados por edge
    const response = {
      success: true,
      count: topGames.length,
      date: gamesData.date,
      matches: topGames
    };
    
    return res.status(200).json(response);
    
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
