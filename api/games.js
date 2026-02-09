import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Usar data de hoje ou uma data com jogos conhecidos para teste
    const today = new Date().toISOString().split('T')[0];
    // Para teste, usar data fixa com jogos: 2025-02-08
    const dateToUse = today; // Altere para '2025-02-08' para testar com jogos reais
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    console.log('📅 Date:', dateToUse);
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');
    
    if (!apiKey) {
      return res.status(200).json({ 
        success: false, 
        games: [], 
        error: 'API_FOOTBALL_KEY not configured in Vercel environment variables' 
      });
    }

    const responseData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'v3.football.api-sports.io',
        port: 443,
        path: `/fixtures?date=${dateToUse}`,
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey
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
      console.error('❌ API Error:', responseData.statusCode, responseData.body.substring(0, 200));
      return res.status(200).json({ 
        success: false, 
        games: [], 
        error: `API returned ${responseData.statusCode}`,
        details: responseData.body.substring(0, 200)
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

    if (!parsed.response || parsed.response.length === 0) {
      return res.status(200).json({ success: true, games: [], message: 'Não há jogos hoje' });
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
