/**
 * services/value-calculator.js
 * Modelo híbrido de cálculo de value betting para home, draw e away
 */

/**
 * Calcular form score (últimos 5 jogos)
 * W = 3 pontos, D = 1 ponto, L = 0 pontos
 */
function calculateFormScore(last5) {
  if (!Array.isArray(last5)) return 0;
  
  let score = 0;
  last5.forEach(result => {
    if (result === 'W') score += 3;
    else if (result === 'D') score += 1;
  });
  
  return score / 15; // Normalizar para 0-1 (máximo 15 pontos)
}

/**
 * Calcular value de um mercado específico
 */
function calculateMarket(game, marketType) {
  // 1. Pegar odd correspondente
  let odd;
  if (marketType === 'home') odd = game.odds.home;
  else if (marketType === 'draw') odd = game.odds.draw;
  else if (marketType === 'away') odd = game.odds.away;
  else return null;
  
  // 2. Probabilidade implícita
  const implied = 1 / odd;
  
  // 3. Calcular ajuste baseado no mercado
  let adjustment = 0;
  
  if (game.stats) {
    const homeFormScore = calculateFormScore(game.stats.homeLast5);
    const awayFormScore = calculateFormScore(game.stats.awayLast5);
    const homeStrengthHome = game.stats.homeGoalsAvg * 3.5; // Escala 0-10
    const awayStrengthAway = game.stats.awayGoalsAvg * 3.5; // Escala 0-10
    const avgGoalsCombined = (game.stats.homeGoalsAvg + game.stats.awayGoalsAvg) / 2;
    const formDiff = Math.abs(homeFormScore - awayFormScore);
    
    if (marketType === 'home') {
      // Regras para HOME
      if (homeFormScore > awayFormScore) adjustment += 0.04;
      if (game.stats.homeGoalsAvg > game.stats.awayConcededAvg) adjustment += 0.03;
      if (homeStrengthHome >= 7) adjustment += 0.02;
      if (game.stats.awayGoalsAvg > game.stats.homeConcededAvg) adjustment -= 0.02;
      
    } else if (marketType === 'away') {
      // Regras para AWAY
      if (awayFormScore > homeFormScore) adjustment += 0.04;
      if (game.stats.awayGoalsAvg > game.stats.homeConcededAvg) adjustment += 0.03;
      if (awayStrengthAway >= 7) adjustment += 0.02;
      if (game.stats.homeGoalsAvg > game.stats.awayConcededAvg) adjustment -= 0.02;
      
    } else if (marketType === 'draw') {
      // Regras para DRAW — exige TODAS as condições simultâneas para evitar empate padrão
      const bothEqualized = formDiff <= 0.15
        && avgGoalsCombined < 1.8
        && Math.abs(game.stats.homeGoalsAvg - game.stats.awayGoalsAvg) < 0.3;
      if (bothEqualized) adjustment += 0.05;
    }
  } else {
    // Sem estatísticas: apenas o favorito forte recebe pequeno ajuste.
    // Draw intencialmente sem bônus para não vencer o reduce por padrão.
    if (marketType === 'home' && odd < 1.7) adjustment += 0.025;
    else if (marketType === 'away' && odd < 1.9) adjustment += 0.02;
  }
  
  // 4. Probabilidade ajustada
  const adjusted = Math.min(0.95, Math.max(0.05, implied + adjustment));
  
  // 5. Edge
  const edge = adjusted - implied;
  
  // 6. Classificação
  let rating;
  if (edge >= 0.08) {
    rating = "Forte oportunidade";
  } else if (edge >= 0.04) {
    rating = "Valor moderado";
  } else if (edge > 0) {
    rating = "Leve valor";
  } else {
    rating = "Sem valor";
  }
  
  return {
    implied: Number((implied * 100).toFixed(2)),
    adjusted: Number((adjusted * 100).toFixed(2)),
    edge: Number((edge * 100).toFixed(2)),
    rating
  };
}

/**
 * Calcular value para todos os mercados e retornar apenas o melhor
 */
export function calculateValue(game) {
  // Calcular para os 3 mercados
  const homeMarket = calculateMarket(game, 'home');
  const drawMarket = calculateMarket(game, 'draw');
  const awayMarket = calculateMarket(game, 'away');
  
  // Determinar o melhor mercado (maior edge)
  const markets = [
    { type: 'home', label: 'Vitória Casa', ...homeMarket },
    { type: 'draw', label: 'Empate', ...drawMarket },
    { type: 'away', label: 'Vitória Fora', ...awayMarket }
  ];
  
  const bestMarketData = markets.reduce((best, current) => {
    return current.edge > best.edge ? current : best;
  });

  // Sem edge real (< 2%) → retorna 'Sem valor claro'
  if (bestMarketData.edge < 2) {
    return {
      bestMarket: bestMarketData.type,
      marketLabel: 'Sem valor claro',
      impliedProb:  bestMarketData.implied,
      adjustedProb: bestMarketData.adjusted,
      edge:         bestMarketData.edge,
      rating:       'Sem valor claro',
    };
  }

  // Retornar apenas o melhor mercado
  return {
    bestMarket: bestMarketData.type,
    marketLabel: bestMarketData.label,
    impliedProb: bestMarketData.implied,
    adjustedProb: bestMarketData.adjusted,
    edge: bestMarketData.edge,
    rating: bestMarketData.rating
  };
}
