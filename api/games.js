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

  // RETORNAR DADOS MOCK TEMPORARIAMENTE PARA TESTAR
  const mockGames = [
    {
      id: 1,
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      competition: 'Premier League',
      country: 'England',
      date: new Date().toISOString(),
      time: '15:00',
      status: 'HOJE',
      homeScore: null,
      awayScore: null,
      homeOdds: 2.10,
      drawOdds: 3.40,
      awayOdds: 3.20,
      stadium: 'Etihad Stadium',
      round: 'Regular Season - 25'
    },
    {
      id: 2,
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      homeFlag: '🇪🇸',
      awayFlag: '🇪🇸',
      competition: 'La Liga',
      country: 'Spain',
      date: new Date().toISOString(),
      time: '16:30',
      status: 'HOJE',
      homeScore: null,
      awayScore: null,
      homeOdds: 2.30,
      drawOdds: 3.20,
      awayOdds: 2.80,
      stadium: 'Camp Nou',
      round: 'Regular Season - 23'
    },
    {
      id: 3,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      homeFlag: '🇩🇪',
      awayFlag: '🇩🇪',
      competition: 'Bundesliga',
      country: 'Germany',
      date: new Date().toISOString(),
      time: '18:00',
      status: 'HOJE',
      homeScore: null,
      awayScore: null,
      homeOdds: 1.95,
      drawOdds: 3.60,
      awayOdds: 3.50,
      stadium: 'Allianz Arena',
      round: 'Regular Season - 22'
    }
  ];

  return res.status(200).json({
    success: true,
    count: mockGames.length,
    games: mockGames,
    message: 'DADOS MOCK - API real temporariamente desabilitada para testes'
  });
}
