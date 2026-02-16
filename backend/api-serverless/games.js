const https = require('https');

// Dados demo para usar enquanto API não está aprovada
const DEMO_GAMES = [
  { id: 1, homeTeam: 'Flamengo', awayTeam: 'Palmeiras', competition: 'Brasileirão', country: 'Brazil', time: '16:00', status: 'HOJE', homeScore: null, awayScore: null, homeOdds: 2.10, drawOdds: 3.25, awayOdds: 3.40 },
  { id: 2, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', competition: 'La Liga', country: 'Spain', time: '17:00', status: 'HOJE', homeScore: null, awayScore: null, homeOdds: 2.30, drawOdds: 3.10, awayOdds: 2.90 },
  { id: 3, homeTeam: 'Manchester City', awayTeam: 'Liverpool', competition: 'Premier League', country: 'England', time: '14:30', status: 'LIVE', homeScore: 2, awayScore: 1, homeOdds: 1.85, drawOdds: 3.50, awayOdds: 4.20 },
  { id: 4, homeTeam: 'PSG', awayTeam: 'Marseille', competition: 'Ligue 1', country: 'France', time: '21:00', status: 'HOJE', homeScore: null, awayScore: null, homeOdds: 1.65, drawOdds: 3.80, awayOdds: 5.50 },
  { id: 5, homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', competition: 'Bundesliga', country: 'Germany', time: '15:30', status: 'LIVE', homeScore: 1, awayScore: 1, homeOdds: 1.75, drawOdds: 3.60, awayOdds: 4.80 },
  { id: 6, homeTeam: 'Corinthians', awayTeam: 'São Paulo', competition: 'Brasileirão', country: 'Brazil', time: '19:00', status: 'HOJE', homeScore: null, awayScore: null, homeOdds: 2.50, drawOdds: 3.10, awayOdds: 2.80 },
  { id: 7, homeTeam: 'Inter Milan', awayTeam: 'AC Milan', competition: 'Serie A', country: 'Italy', time: '20:45', status: 'HOJE', homeScore: null, awayScore: null, homeOdds: 2.20, drawOdds: 3.20, awayOdds: 3.10 },
  { id: 8, homeTeam: 'Benfica', awayTeam: 'Porto', competition: 'Primeira Liga', country: 'Portugal', time: '22:00', status: 'HOJE', homeScore: null, awayScore: null, homeOdds: 2.35, drawOdds: 3.15, awayOdds: 2.95 },
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Data de hoje
    const today = new Date().toISOString().split('T')[0];
    const dateToUse = today;
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    console.log('📅 Date:', dateToUse);
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');
    
    // Se não tem API key ou está vazia, retornar dados demo
    if (!apiKey || apiKey.length < 10) {
      console.log('⚠️ Using demo data - no valid API key');
      return res.status(200).json({ 
        success: true, 
        games: DEMO_GAMES,
        demo: true,
        message: 'Usando dados de demonstração'
      });
    }

    const responseData = await new Promise((resolve, reject) => {
      // RAPIDAPI - headers e hostname diferentes
      const options = {
        hostname: 'api-football-v1.p.rapidapi.com',
        port: 443,
        path: `/v3/fixtures?date=${dateToUse}`,
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
        }
      };
      
      console.log('🌐 Request:', options.hostname + options.path);
      
      const request = https.request(options, (response) => {
        console.log('📡 Status:', response.statusCode);
        
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          console.log('📦 Response length:', data.length);
          resolve({ statusCode: response.statusCode, body: data });
        });
      });
      
      request.on('error', error => {
        console.error('💥 Request error:', error.message);
        reject(error);
      });
      
      request.setTimeout(15000, () => {
        request.destroy();
        reject(new Error('Request timeout after 15s'));
      });
      
      request.end();
    });

    if (responseData.statusCode !== 200) {
      console.error('❌ API Error:', responseData.statusCode, '- Using demo data as fallback');
      // Se API retornar erro (403 = não aprovado), usar dados demo
      return res.status(200).json({ 
        success: true, 
        games: DEMO_GAMES,
        demo: true,
        message: 'API pendente - usando dados de demonstração'
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(responseData.body);
    } catch (e) {
      console.error('💥 JSON parse error');
      return res.status(200).json({ success: false, games: [], error: 'Invalid JSON from API' });
    }

    console.log('✅ Parsed:', parsed.response?.length || 0, 'fixtures');
    
    // Debug: se não há jogos, retornar info de debug
    if (!parsed.response || parsed.response.length === 0) {
      return res.status(200).json({ 
        success: true, 
        games: [], 
        message: 'Não há jogos hoje',
        debug: {
          date: dateToUse,
          apiErrors: parsed.errors || null,
          results: parsed.results || 0,
          paging: parsed.paging || null
        }
      });
    }

    const games = parsed.response.slice(0, 50).map(f => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      competition: f.league.name,
      country: f.league.country,
      time: new Date(f.fixture.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZone: 'America/Sao_Paulo' 
      }),
      status: f.fixture.status.short === 'NS' ? 'HOJE' : 
              ['1H','2H','HT'].includes(f.fixture.status.short) ? 'LIVE' : 
              f.fixture.status.short === 'FT' ? 'FIM' : f.fixture.status.short,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      homeOdds: 2.40,
      drawOdds: 3.20,
      awayOdds: 2.85
    }));

    console.log('✅ Returning', games.length, 'games');
    return res.status(200).json({ success: true, games });

  } catch (error) {
    console.error('💥 Error:', error.message);
    return res.status(200).json({ success: false, games: [], error: error.message });
  }
}
