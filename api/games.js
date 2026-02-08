export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Apenas GET permitido' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    console.log('🔄 Buscando jogos para:', today);
    console.log('🔑 API Key:', apiKey ? 'Configurada' : 'NÃO CONFIGURADA');
    
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        count: 0,
        games: [],
        error: 'API Key não configurada'
      });
    }
    
    const apiUrl = `https://v3.football.api-football.com/fixtures?date=${today}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey
      }
    });

    if (!response.ok) {
      console.error('❌ API retornou erro:', response.status);
      return res.status(200).json({
        success: false,
        count: 0,
        games: [],
        error: `API retornou status ${response.status}`
      });
    }

    const data = await response.json();
    
    console.log('📦 Total de jogos:', data.response?.length || 0);
    
    if (!data.response || !Array.isArray(data.response)) {
      return res.status(200).json({
        success: false,
        count: 0,
        games: [],
        error: 'Resposta inválida da API'
      });
    }
    
    if (data.response.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        games: [],
        message: 'Não há jogos hoje'
      });
    }

    const games = data.response.map(fixture => {
      const statusMap = {
        'NS': 'HOJE',
        '1H': 'LIVE',
        '2H': 'LIVE',
        'HT': 'INTERVALO',
        'FT': 'FINALIZADO',
        'PST': 'ADIADO',
        'CANC': 'CANCELADO'
      };

      const getFlag = (country) => {
        const flags = {
          'Brazil': '🇧🇷',
          'Spain': '🇪🇸',
          'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          'Germany': '🇩🇪',
          'France': '🇫🇷',
          'Italy': '🇮🇹',
          'Portugal': '🇵🇹',
          'Netherlands': '🇳🇱',
          'Argentina': '🇦🇷',
          'World': '🌍'
        };
        return flags[country] || '⚽';
      };

      return {
        id: fixture.fixture.id,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeFlag: getFlag(fixture.league.country),
        awayFlag: getFlag(fixture.league.country),
        competition: fixture.league.name,
        country: fixture.league.country,
        date: fixture.fixture.date,
        time: new Date(fixture.fixture.date).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        }),
        status: statusMap[fixture.fixture.status.short] || fixture.fixture.status.short,
        homeScore: fixture.goals.home ?? null,
        awayScore: fixture.goals.away ?? null,
        homeOdds: 2.40,
        drawOdds: 3.20,
        awayOdds: 2.85,
        stadium: fixture.fixture.venue?.name || '',
        round: fixture.league.round || ''
      };
    });
    
    console.log('✅ Retornando', games.length, 'jogos');
    
    return res.status(200).json({
      success: true,
      count: games.length,
      games: games,
      message: null
    });
  } catch (error) {
    console.error('💥 ERRO:', error.message);
    
    return res.status(200).json({
      success: false,
      count: 0,
      games: [],
      error: `Erro: ${error.message}`
    });
  }
}
