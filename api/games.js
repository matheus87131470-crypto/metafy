export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const today = new Date().toISOString().split('T')[0];
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    console.log('🔄 Fetching games for:', today);
    console.log('🔑 API Key:', apiKey ? 'Configured' : 'NOT CONFIGURED');
    
    if (!apiKey) {
      return res.status(200).json({ success: false, games: [], error: 'API Key not configured' });
    }
    
    const apiUrl = `https://v3.football.api-football.com/fixtures?date=${today}`;
    const response = await fetch(apiUrl, { headers: { 'x-apisports-key': apiKey } });

    if (!response.ok) {
      return res.status(200).json({ success: false, games: [], error: `API error ${response.status}` });
    }

    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response) || data.response.length === 0) {
      return res.status(200).json({ success: true, games: [], message: 'No games today' });
    }

    const games = data.response.map(f => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeFlag: '⚽',
      awayFlag: '⚽',
      competition: f.league.name,
      country: f.league.country,
      date: f.fixture.date,
      time: new Date(f.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
      status: f.fixture.status.short === 'NS' ? 'HOJE' : f.fixture.status.short === 'LIVE' ? 'LIVE' : f.fixture.status.short === 'FT' ? 'FINALIZADO' : 'HOJE',
      homeScore: f.goals.home ?? null,
      awayScore: f.goals.away ?? null,
      homeOdds: 2.40,
      drawOdds: 3.20,
      awayOdds: 2.85,
      stadium: f.fixture.venue?.name || '',
      round: f.league.round || ''
    }));
    
    console.log('✅ Returning', games.length, 'games');
    return res.status(200).json({ success: true, games });
    
  } catch (error) {
    console.error('💥 ERROR:', error.message);
    return res.status(200).json({ success: false, games: [], error: error.message });
  }
}
