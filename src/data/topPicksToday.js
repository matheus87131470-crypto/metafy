// =====================================================
// src/data/topPicksToday.js
// Fallback estático — exibido quando o backend estiver indisponível.
// loadTopPicks() em app.js substitui por dados reais em runtime.

window.TOP_PICKS_TODAY_FALLBACK = [
  {
    id: 'fb-mock-1',
    league: 'Champions League',
    leagueId: 2,
    time: '17:00',
    home: 'Manchester City',
    away: 'Real Madrid',
    market: 'Gols',
    pick: 'Over 2.5',
    confidencePct: '88.4',
    confidenceLevel: 'ALTA CONFIANÇA',
    levelClass: 'high',
    explanation: 'Confronto de alto nível com histórtico ofensivo elevado. As duas últimas edições deste duelo tiveram média de 3,2 gols. City joga no Etihad com pressão total.',
    keyStats: [
      'Últimos 5 jogos do City: 4,0 gols/jogo em casa',
      'Real Madrid marcou em 9 dos últimos 10 jogos europeus',
      'Média de 3,2 gols neste confronto na UCL (últimas 3 edições)',
      'Árbitro escolhido tende a 4+ cartões, duelos físicos',
    ],
  },
  {
    id: 'fb-mock-2',
    league: 'Premier League',
    leagueId: 39,
    time: '13:30',
    home: 'Arsenal',
    away: 'Chelsea',
    market: 'Resultado',
    pick: 'Casa vence',
    confidencePct: '82.1',
    confidenceLevel: 'ALTA CONFIANÇA',
    levelClass: 'high',
    explanation: 'Arsenal em excelente fase em casa, com seis vitórias seguidas no Emirates. Chelsea atravessa crise defensiva e vem de derrota fora de casa.',
    keyStats: [
      'Arsenal: 6 vitórias consecutivas em casa (PL)',
      'Chelsea: 0 clean sheets nos últimos 5 jogos como visitante',
      'Arsenal tem melhor xG em casa da liga: 2,3/jogo',
      'Historico recente: Arsenal venceu 3 dos últimos 4 derbys',
    ],
  },
  {
    id: 'fb-mock-3',
    league: 'La Liga',
    leagueId: 140,
    time: '16:00',
    home: 'Barcelona',
    away: 'Atlético Madrid',
    market: 'Ambas Marcam',
    pick: 'Sim',
    confidencePct: '76.8',
    confidenceLevel: 'MÉDIA CONFIANÇA',
    levelClass: 'medium',
    explanation: 'Clássico espanhol com alto potencial de gols dos dois lados. Atlético sempre marca contra o Barça e o Camp Nou tende a abrir o jogo.',
    keyStats: [
      'Ambas marcam em 7 dos últimos 10 derbys entre os dois',
      'Atlético teve pelo menos 1 gol em todos os últimos 8 jogos',
      'Barcelona: David Lewandowski em boa fase (4 gols nas últimas 3 partidas)',
      'Último encontro: Barcelona 2 × 2 Atlético',
    ],
  },
  {
    id: 'fb-mock-4',
    league: 'Brasileirão Série A',
    leagueId: 71,
    time: '20:00',
    home: 'Flamengo',
    away: 'Palmeiras',
    market: 'Gols',
    pick: 'Over 1.5',
    confidencePct: '84.5',
    confidenceLevel: 'ALTA CONFIANÇA',
    levelClass: 'high',
    explanation: 'Superfinal do futebol brasileiro. Os dois grandes com ataque em alta. Probabilidade baixíssima de 0 a 0 neste confronto histórico no Maracanã.',
    keyStats: [
      'Flamengo marcou em 9 dos últimos 10 jogos em casa',
      'Palmeiras: 6 gols nos últimos 3 jogos fora',
      'Histório: 0 a 0 em apenas 1 dos últimos 15 confrontos',
      'Média de gols deste confronto: 2,7 por partida',
    ],
  },
  {
    id: 'fb-mock-5',
    league: 'Bundesliga',
    leagueId: 78,
    time: '15:30',
    home: 'Bayern München',
    away: 'Borussia Dortmund',
    market: 'Gols',
    pick: 'Over 3.5',
    confidencePct: '73.2',
    confidenceLevel: 'MÉDIA CONFIANÇA',
    levelClass: 'medium',
    explanation: 'Der Klassiker — o clássico alemão é historicamente um dos jogos com mais gols da Europa. Bayern no Allianz Arena com ataque letal.',
    keyStats: [
      'Média de 4,1 gols nos últimos 10 Klassikers',
      'Bayern: maior média de gols em casa da Bundesliga (3,2/jogo)',
      'Dortmund também marca muito fora: 1,8 gol/jogo como visitante',
      '7 dos últimos 10 Der Klassiker tiveram 4+ gols',
    ],
  },
];
// Fallback local  usado apenas se a API-Football
// estiver indisponível (window.TOP_PICKS_TODAY é
// preenchido em runtime por loadTopPicks()).
// =====================================================

// Começa vazio: loadTopPicks() em app.js preenche com
// dados reais. Se a API falhar, mostra "Sem jogos hoje".
window.TOP_PICKS_TODAY = [];
