// =====================================================
// src/data/topPicksToday.js
// Top Picks do dia — renderização offline, sem backend
// =====================================================

window.TOP_PICKS_TODAY = [
  {
    id: "tp1",
    league: "CAMPEONATO BRASILEIRO",
    time: "20:00",
    home: "Flamengo",
    away: "Palmeiras",
    market: "Gols",
    pick: "Under 3.5",
    confidencePct: 89.3,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "Confronto direto com alto nível defensivo. As duas equipes têm média combinada de 2.1 gols nos últimos 5 H2H.",
    keyStats: [
      "Média de gols H2H (últ. 5): 2.1",
      "Flamengo: 3 dos últimos 5 jogos under 3.5",
      "Palmeiras: 4 dos últimos 5 jogos under 3.5",
      "Defesas entre as top 3 do campeonato",
      "Jogo de alto nível competitivo com cautela tática"
    ]
  },
  {
    id: "tp2",
    league: "LA LIGA",
    time: "21:00",
    home: "Real Madrid",
    away: "Barcelona",
    market: "Gols",
    pick: "Under 3.5",
    confidencePct: 94.8,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "El Clásico historicamente contido. Alta pressão tática reduz espaços e limita gols totais.",
    keyStats: [
      "Últimos 6 Clásicos: média de 2.3 gols",
      "Ambas defesas entre as 2 melhores da liga",
      "Over 3.5 só aconteceu 1x nos últimos 8 H2H",
      "Pressão de campeonato aumenta conservadorismo"
    ]
  },
  {
    id: "tp3",
    league: "PREMIER LEAGUE",
    time: "16:00",
    home: "Man City",
    away: "Newcastle",
    market: "Resultado",
    pick: "Man City vence",
    confidencePct: 82.4,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "City em ótima fase em casa com posse dominante. Newcastle sem três titulares por lesão.",
    keyStats: [
      "Man City: 8 vitórias em casa nas últimas 10",
      "Newcastle: 1 vitória fora nos últimos 6",
      "Média de gols City em casa: 2.4",
      "Ausência de Isak e Trippier no Newcastle"
    ]
  },
  {
    id: "tp4",
    league: "PREMIER LEAGUE",
    time: "16:00",
    home: "Chelsea",
    away: "Burnley",
    market: "Gols",
    pick: "Over 1.5",
    confidencePct: 76.2,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "Linha de aposta extremamente segura. Os dois times marcaram em 9 dos últimos 10 jogos.",
    keyStats: [
      "Chelsea: Over 1.5 em 8 dos últimos 10",
      "Burnley: Over 1.5 em 7 dos últimos 10",
      "H2H: todos os últimos 5 jogos over 1.5",
      "Mínimo de risco estatístico"
    ]
  },
  {
    id: "tp5",
    league: "SERIE A",
    time: "18:00",
    home: "Juventus",
    away: "Como",
    market: "Resultado",
    pick: "Juventus DNB",
    confidencePct: 81.6,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "DNB elimina risco de empate. Juventus superior em qualidade mas defensivamente organiza e raramente perde em casa.",
    keyStats: [
      "Juventus em casa: 7V, 2E, 1D (últ. 10)",
      "Como: 1 vitória fora nos últimos 8",
      "Handicap de qualidade favorece amplamente Juve",
      "DNB protege contra único cenário de risco (empate)"
    ]
  },
  {
    id: "tp6",
    league: "SERIE A",
    time: "18:00",
    home: "Inter",
    away: "Lecce",
    market: "Resultado",
    pick: "Inter DNB",
    confidencePct: 78.9,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "Inter entre as melhores da Europa em casa. Lecce com pior ataque visitante da liga.",
    keyStats: [
      "Inter em casa: invicto nos últimos 11",
      "Lecce visitante: 1V, 2E, 9D na temporada",
      "DNB com odd razoável garante retorno justo",
      "Diferença de elenco muito grande"
    ]
  },
  {
    id: "tp7",
    league: "LA LIGA",
    time: "19:00",
    home: "Betis",
    away: "Rayo Vallecano",
    market: "Gols",
    pick: "Under 3.5",
    confidencePct: 72.5,
    confidenceLevel: "MÉDIA CONFIANÇA",
    levelClass: "medium",
    explanation: "Confronto regional equilibrado. Rayo foca em bloco defensivo fora de casa.",
    keyStats: [
      "H2H: 4 dos últimos 5 finalizaram under 3.5",
      "Rayo visitante: média 1.6 gols por jogo",
      "Betis com tendência de jogos travados em casa",
      "Confronto equilibrado reduz espaços ofensivos"
    ]
  },
  {
    id: "tp8",
    league: "PREMIER LEAGUE",
    time: "19:00",
    home: "Aston Villa",
    away: "Leeds",
    market: "Ambas Marcam",
    pick: "Sim",
    confidencePct: 68.4,
    confidenceLevel: "MÉDIA CONFIANÇA",
    levelClass: "medium",
    explanation: "Ambos os times com ataque produtivo e defesa com brechas. Boas chances dos dois lados.",
    keyStats: [
      "Aston Villa: BTTS em 6 dos últimos 10",
      "Leeds: marcou em 8 dos últimos 10 jogos",
      "Ambas defesas com média de 1.5+ gols sofridos",
      "Confronto com potencial ofensivo claro"
    ]
  },
  {
    id: "tp9",
    league: "PREMIER LEAGUE",
    time: "20:00",
    home: "West Ham",
    away: "Bournemouth",
    market: "Gols",
    pick: "Over 1.5",
    confidencePct: 74.7,
    confidenceLevel: "ALTA CONFIANÇA",
    levelClass: "high",
    explanation: "Dois times de ataque agressivo. Linha extremamente conservadora com alta taxa histórica.",
    keyStats: [
      "West Ham: Over 1.5 em 9 dos últimos 10",
      "Bournemouth: Over 1.5 em 8 dos últimos 10",
      "H2H: Over 1.5 em todos os últimos 6 jogos",
      "Linha de aposta ultra-segura"
    ]
  },
  {
    id: "tp10",
    league: "PREMIER LEAGUE",
    time: "20:00",
    home: "Brentford",
    away: "Brighton",
    market: "Gols",
    pick: "Over 1.5",
    confidencePct: 71.2,
    confidenceLevel: "MÉDIA CONFIANÇA",
    levelClass: "medium",
    explanation: "Dois times ofensivos que raramente terminam 0x0. Histórico consistente de gols.",
    keyStats: [
      "Brentford: 0x0 em apenas 1 dos últimos 15",
      "Brighton: ataque entre top 5 da PL",
      "Over 1.5 em 7 dos últimos 8 H2H",
      "Ambos precisam de pontos — jogo aberto"
    ]
  }
];
