/**
 * routes/matches-today.js
 * Endpoint Express para retornar partidas agendadas de hoje
 * Usa dados locais estáticos
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar dados locais
const gamesDataPath = join(__dirname, '../data/enhanced-games.json');
let gamesData = null;

function loadGamesData() {
  try {
    const rawData = readFileSync(gamesDataPath, 'utf-8');
    gamesData = JSON.parse(rawData);
    console.log('✅ Dados de jogos carregados:', gamesData.matches.length, 'partidas');
  } catch (error) {
    console.error('❌ Erro ao carregar enhanced-games.json:', error.message);
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
    console.log('🔄 GET /api/matches/today');
    
    // Retornar dados locais
    const response = {
      success: true,
      count: gamesData.matches.length,
      date: gamesData.date,
      matches: gamesData.matches
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
