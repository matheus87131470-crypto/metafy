/**
 * services/value-calculator.js
 * Modelo híbrido de cálculo de value betting
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
 * Calcular value de uma aposta
 */
export function calculateValue(game) {
  // 1. Probabilidade implícita das odds
  const impliedProb = 1 / game.odds.home;
  
  // 2. Calcular fatores de ajuste
  let adjustment = 0;
  
  // Se o jogo tem estatísticas detalhadas
  if (game.stats) {
    const homeFormScore = calculateFormScore(game.stats.homeLast5);
    const awayFormScore = calculateFormScore(game.stats.awayLast5);
    
    // Forma recente favorece casa
    if (homeFormScore > awayFormScore) {
      adjustment += 0.04;
    }
    
    // Ataque casa vs Defesa visitante
    if (game.stats.homeGoalsAvg > game.stats.awayConcededAvg) {
      adjustment += 0.03;
    }
    
    // Força em casa (baseado em gols marcados)
    const homeStrengthHome = game.stats.homeGoalsAvg * 3.5; // Escala 0-10
    if (homeStrengthHome >= 7) {
      adjustment += 0.02;
    }
    
    // Ataque visitante vs Defesa casa (penaliza casa)
    if (game.stats.awayGoalsAvg > game.stats.homeConcededAvg) {
      adjustment -= 0.02;
    }
  } else {
    // Sem estatísticas: ajuste conservador baseado apenas nas odds
    // Se odds casa < 2.0 (favorito claro)
    if (game.odds.home < 2.0) {
      adjustment += 0.02;
    }
  }
  
  // 3. Probabilidade ajustada
  const adjustedProb = Math.min(0.95, Math.max(0.05, impliedProb + adjustment));
  
  // 4. Edge (vantagem)
  const edge = adjustedProb - impliedProb;
  
  // 5. Classificação
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
    impliedProb: Number((impliedProb * 100).toFixed(2)),
    adjustedProb: Number((adjustedProb * 100).toFixed(2)),
    edge: Number((edge * 100).toFixed(2)),
    rating
  };
}
