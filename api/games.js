/**
 * api/games.js - Endpoint Serverless para Buscar Jogos
 * GET /api/games
 */

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Apenas GET permitido' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const apiKey = process.env.API_SPORTS_KEY || 'demo';
    
    console.log('🔄 Buscando jogos para:', today);
    
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      console.error('❌ API retornou erro:', response.status);
      return res.status(200).json({
        success: false,
        count: 0,
        games: [],
        error: 'API externa indisponível'
      });
    }

    const data = await response.json();
    console.log('📊 API response:', data.results, 'jogos encontrados');
    
    if (!data.response || data.response.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        games: [],
        message: 'Nenhum jogo encontrado para hoje'
      });
    }

    // Filtrar e processar jogos
    const importantLeagues = [39, 140, 78, 61, 135, 2, 3, 88];
    const games = data.response
      .filter(f => importantLeagues.includes(f.league.id))
      .slice(0, 10)
      .map(fixture => {
        const statusMap = {
          'NS': 'HOJE',
          '1H': 'LIVE',
          '2H': 'LIVE',
          'HT': 'LIVE',
          'FT': 'FT',
          'PST': 'ADIADO'
        };

        const flags = {
          'Brazil': '🇧🇷',
          'Spain': '🇪🇸',
          'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          'Germany': '🇩🇪',
          'France': '🇫🇷',
          'Italy': '🇮🇹',
          'Portugal': '🇵🇹',
          'World': '🌍'
        };

        return {
          id: fixture.fixture.id,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeFlag: flags[fixture.league.country] || '⚽',
          awayFlag: flags[fixture.league.country] || '⚽',
          competition: fixture.league.name,
          country: fixture.league.country,
          date: fixture.fixture.date,
          time: new Date(fixture.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: statusMap[fixture.fixture.status.short] || 'HOJE',
          homeScore: fixture.goals.home,
          awayScore: fixture.goals.away,
          homeOdds: 2.40,
          drawOdds: 3.20,
          awayOdds: 2.85,
          stadium: fixture.fixture.venue?.name || ''
        };
      });
    
    return res.status(200).json({
      success: true,
      count: games.length,
      games: games,
      message: null
    });
  } catch (error) {
    console.error('❌ Erro ao buscar jogos:', error);
    
    return res.status(200).json({
      success: false,
      count: 0,
      games: [],
      error: 'Erro ao buscar jogos da API'
    });
  }
};
