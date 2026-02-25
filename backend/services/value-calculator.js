/**
 * services/value-calculator.js
 * Selecao de mercado por probabilidade ajustada.
 */

const FALLBACK_ODDS = {
  home: { home: 2.05, draw: 3.25, away: 3.60 },
  away: { home: 3.10, draw: 3.25, away: 2.35 },
  draw: { home: 2.55, draw: 3.10, away: 2.85 },
  none: { home: 2.35, draw: 3.10, away: 3.05 },
};

export function calculateValue(game) {
  var hasRealOdds = game.odds && game.odds.home && game.odds.draw && game.odds.away;
  var odds;
  if (hasRealOdds) {
    odds = { home: +game.odds.home, draw: +game.odds.draw, away: +game.odds.away };
  } else {
    var dir = (game.valueAnalysis && game.valueAnalysis.bestMarket) || 'none';
    odds = FALLBACK_ODDS[dir] || FALLBACK_ODDS.none;
  }

  var pH0 = 1 / odds.home;
  var pD0 = 1 / odds.draw;
  var pA0 = 1 / odds.away;
  var sum  = pH0 + pD0 + pA0;
  var pH = pH0 / sum;
  var pD = pD0 / sum;
  var pA = pA0 / sum;

  if (pH >= 0.33 && pH <= 0.48) {
    var boost = 0.015;
    var ratio = (pD + pA > 0) ? (1 - boost / (pD + pA)) : 1;
    pH += boost;
    pD *= ratio;
    pA *= ratio;
    var s2 = pH + pD + pA;
    pH /= s2; pD /= s2; pA /= s2;
  }

  var bestType, bestLabel, bestProb, bestOdd;

  if (Math.abs(pH - pA) < 0.07 && pD > 0.26) {
    bestType = 'draw'; bestLabel = 'Empate'; bestProb = pD; bestOdd = odds.draw;
  } else if (pH >= pD && pH >= pA) {
    bestType = 'home'; bestLabel = 'Vitoria Casa'; bestProb = pH; bestOdd = odds.home;
  } else if (pA >= pD && pA >= pH) {
    bestType = 'away'; bestLabel = 'Vitoria Fora'; bestProb = pA; bestOdd = odds.away;
  } else {
    bestType = 'draw'; bestLabel = 'Empate'; bestProb = pD; bestOdd = odds.draw;
  }

  var impliedOrig   = (1 / bestOdd) / sum * 100;
  var adjustedPct   = bestProb * 100;
  var edgePct       = parseFloat((adjustedPct - impliedOrig).toFixed(2));
  var t             = Math.min(1, Math.max(0, (bestProb - 0.28) / 0.27));
  var confidencePct = parseFloat((54 + t * 24).toFixed(1));
  var rating        = confidencePct >= 68 ? 'Forte' : confidencePct >= 60 ? 'Moderada' : 'Leve';

  return {
    bestMarket: bestType, marketLabel: bestLabel,
    impliedProb: parseFloat(impliedOrig.toFixed(2)),
    adjustedProb: parseFloat(adjustedPct.toFixed(2)),
    edge: edgePct, rating: rating, confidencePct: confidencePct,
  };
}

export function calculateFormScore(last5) {
  if (!Array.isArray(last5)) return 0;
  var score = 0;
  last5.forEach(function(r) { if (r === 'W') score += 3; else if (r === 'D') score += 1; });
  return score / 15;
}