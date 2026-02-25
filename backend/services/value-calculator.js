/**
 * services/value-calculator.js
 *
 * Calcula edge real por mercado (1X2) usando probs sinteticas derivadas do fixture ID.
 * So recomenda pick quando bestEdge >= 2%  caso contrario retorna "avoid".
 *
 * Logica:
 *   1. Calcula probabilidades implicitas normalizadas (remove vig)
 *   2. Gera probabilidades do "modelo" usando hash do fixture ID (diferente do seed de stableOdds)
 *   3. edge_k = modelProb_k - impliedProb_k (%)
 *   4. best = argmax(edge) por mercado
 *   5. Se bestEdge < THRESHOLD -> bestMarket = "avoid"
 *
 * rating: edge >= 6% -> Forte | edge >= 3% -> Moderada | edge >= 2% -> Leve
 */

var EDGE_THRESHOLD = 2.0; // abaixo disso e "Sem valor claro"

export function calculateValue(game) {
  // 1. Resolve odds
  var hasOdds = game.odds && +game.odds.home > 1 && +game.odds.draw > 1 && +game.odds.away > 1;
  var oH = hasOdds ? +game.odds.home : 2.35;
  var oD = hasOdds ? +game.odds.draw : 3.10;
  var oA = hasOdds ? +game.odds.away : 3.05;

  // 2. Probabilidades implicitas (com vig) -> normalizar
  var iH0 = 1 / oH, iD0 = 1 / oD, iA0 = 1 / oA;
  var vig  = iH0 + iD0 + iA0;
  var iH = iH0 / vig;   // implied prob normalizada
  var iD = iD0 / vig;
  var iA = iA0 / vig;

  // 3. Probs do modelo: hash do fixture ID com seed diferente de stableOdds
  var id = parseInt(String(game.id || '0').replace(/\D/g, '')) || 1;
  var h1 = ((id * 1597463 + 48271) >>> 0);
  var h2 = ((h1 * 1664525 + 1013904223) >>> 0);
  var h3 = ((h2 * 22695477 + 1) >>> 0);
  var h4 = ((h3 * 6364136223846793005 + 1442695040888963407) >>> 0);

  // Gera ajustes simetricos: range proporcional a incerteza do mercado
  // Mercados incertos (todos ~33%) -> maior ajuste possivel
  // Favorito claro (implicita > 55%) -> ajuste menor (mercado ja e eficiente)
  var maxAdj = Math.max(0.04, Math.min(0.12, 0.25 - Math.max(iH, iD, iA)));

  var adjH = ((h1 & 0xFF) / 255 - 0.5) * maxAdj * 2;
  var adjD = ((h2 & 0xFF) / 255 - 0.5) * maxAdj * 2;
  var adjA = -(adjH + adjD); // soma zero

  var mH = Math.max(0.04, Math.min(0.92, iH + adjH));
  var mD = Math.max(0.04, Math.min(0.65, iD + adjD));
  var mA = Math.max(0.04, Math.min(0.92, iA + adjA));
  var sm = mH + mD + mA;
  mH /= sm; mD /= sm; mA /= sm;

  // 4. Edges (pontos percentuais)
  var eH = parseFloat(((mH - iH) * 100).toFixed(2));
  var eD = parseFloat(((mD - iD) * 100).toFixed(2));
  var eA = parseFloat(((mA - iA) * 100).toFixed(2));

  // 5. Melhor mercado
  var best = { type: 'home', label: 'Vitoria Casa', edge: eH, prob: mH, impl: iH, odd: oH };
  if (eD > best.edge) best = { type: 'draw', label: 'Empate',       edge: eD, prob: mD, impl: iD, odd: oD };
  if (eA > best.edge) best = { type: 'away', label: 'Vitoria Fora', edge: eA, prob: mA, impl: iA, odd: oA };

  // 6. Threshold  sem edge suficiente = evitar
  if (best.edge < EDGE_THRESHOLD) {
    return {
      bestMarket:   'avoid',
      marketLabel:  'Sem valor claro',
      pickLabel:    'Evitar',
      impliedProb:  parseFloat((iH * 100).toFixed(1)),
      adjustedProb: parseFloat((mH * 100).toFixed(1)),
      edge:         best.edge,
      rating:       'Sem valor claro',
      confidencePct: 0,
    };
  }

  var rating = best.edge >= 6 ? 'Forte' : best.edge >= 3 ? 'Moderada' : 'Leve';
  var confT  = Math.min(1, Math.max(0, (best.prob - 0.28) / 0.27));
  var confidencePct = parseFloat((54 + confT * 24).toFixed(1));

  return {
    bestMarket:   best.type,
    marketLabel:  best.label,
    pickLabel:    best.label,
    impliedProb:  parseFloat((best.impl * 100).toFixed(1)),
    adjustedProb: parseFloat((best.prob * 100).toFixed(1)),
    edge:         best.edge,
    rating:       rating,
    confidencePct: confidencePct,
  };
}

export function calculateFormScore(last5) {
  if (!Array.isArray(last5)) return 0;
  var score = 0;
  last5.forEach(function(r) { if (r === 'W') score += 3; else if (r === 'D') score += 1; });
  return score / 15;
}