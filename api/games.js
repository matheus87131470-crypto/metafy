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
    console.log('🕐 Timezone servidor:', new Date().toString());
    console.log('🔑 API Key:', apiKey === 'demo' ? 'DEMO (pode não funcionar)' : 'Configurada');
    
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
        error: `API externa retornou status ${response.status}`
      });
    }

    const data = await response.json();
    
    // LOG COMPLETO DA RESPOSTA BRUTA
    console.log('📦 RESPOSTA BRUTA DA API:', JSON.stringify(data, null, 2));
    console.log('📊 Total de jogos retornados pela API:', data.response ? data.response.length : 0);
    console.log('📋 Estrutura da resposta:', {
      hasResponse: !!data.response,
      isArray: Array.isArray(data.response),
      length: data.response?.length || 0,
      errors: data.errors || 'nenhum',
      results: data.results || 0
    });
    
    if (!data.response || data.response.length === 0) {
      console.warn('⚠️ API retornou array vazio - Nenhum jogo hoje');
      return res.status(200).json({
        success: true,
        count: 0,
        games: [],
        message: 'Nenhum jogo encontrado para hoje',
        debug: {
          date: today,
          timezone: new Date().toString(),
          apiResponse: data
        }
      });
    }

    // LOG ANTES DO FILTRO
    console.log('🔍 ANTES DO FILTRO - Ligas disponíveis:', 
      [...new Set(data.response.map(f => `${f.league.name} (ID: ${f.league.id})`))].slice(0, 20)
    );

    // REMOVER FILTROS TEMPORARIAMENTE PARA DEBUG
    const importantLeagues = [39, 140, 78, 61, 135, 2, 3, 88];
    const gamesFiltered = data.response.filter(f => importantLeagues.includes(f.league.id));
    
    console.log('🎯 APÓS FILTRO:', {
      total: data.response.length,
      filtrados: gamesFiltered.length,
      ligasAceitas: importantLeagues,
      primeiros5jogos: data.response.slice(0, 5).map(f => ({
        liga: f.league.name,
        ligaId: f.league.id,
        jogo: `${f.teams.home.name} vs ${f.teams.away.name}`,
        horario: f.fixture.date
      }))
    });
    
    // SE FILTRO REMOVER TUDO, RETORNAR OS 10 PRIMEIROS SEM FILTRO
    const gamesToUse = gamesFiltered.length > 0 ? gamesFiltered.slice(0, 10) : data.response.slice(0, 10);
    
    console.log(`✅ Usando ${gamesToUse.length} jogos ${gamesFiltered.length === 0 ? '(SEM FILTRO DE LIGA)' : '(COM FILTRO)'}`);
    
    const games = gamesToUse.map(fixture => {
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
