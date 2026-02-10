// Serviço de Análise IA
// Gera análises inteligentes baseadas nos dados do jogo

class AIAnalysisService {
  constructor() {
    this.analysisCount = this.loadAnalysisCount();
    this.maxFreeAnalysis = 3;
  }

  loadAnalysisCount() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('metafy_analysis');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        return data.count;
      }
    }
    return 0;
  }

  saveAnalysisCount() {
    localStorage.setItem('metafy_analysis', JSON.stringify({
      date: new Date().toDateString(),
      count: this.analysisCount
    }));
  }

  canAnalyze() {
    return this.analysisCount < this.maxFreeAnalysis;
  }

  getRemainingAnalysis() {
    return Math.max(0, this.maxFreeAnalysis - this.analysisCount);
  }

  incrementAnalysis() {
    this.analysisCount++;
    this.saveAnalysisCount();
  }

  // Gera análise baseada nos dados do jogo
  generateAnalysis(game) {
    if (!this.canAnalyze()) {
      return {
        success: false,
        limitReached: true,
        message: 'Limite de análises atingido'
      };
    }

    this.incrementAnalysis();

    // Calcular probabilidades baseadas em odds e forma
    const homeWinProb = this.calculateProbability(game.homeOdds);
    const drawProb = this.calculateProbability(game.drawOdds);
    const awayWinProb = this.calculateProbability(game.awayOdds);

    // Ajustar baseado na forma recente
    const homeFormScore = this.calculateFormScore(game.homeForm);
    const awayFormScore = this.calculateFormScore(game.awayForm);
    
    // Over/Under
    const overUnderProb = this.calculateOverUnder(game);
    
    // BTTS
    const bttsProb = this.calculateBTTS(game);
    
    // Confiança geral
    const confidence = this.calculateConfidence(homeWinProb, awayWinProb, homeFormScore, awayFormScore);

    // Previsão principal
    const prediction = this.getPrediction(homeWinProb, drawProb, awayWinProb, game);

    return {
      success: true,
      limitReached: false,
      remaining: this.getRemainingAnalysis(),
      analysis: {
        prediction,
        probabilities: {
          home: Math.round(homeWinProb),
          draw: Math.round(drawProb),
          away: Math.round(awayWinProb)
        },
        markets: {
          overUnder: {
            over25: overUnderProb.over,
            under25: overUnderProb.under
          },
          btts: {
            yes: bttsProb.yes,
            no: bttsProb.no
          }
        },
        confidence,
        form: {
          home: homeFormScore,
          away: awayFormScore
        },
        h2h: game.h2h || null,
        reasoning: this.generateReasoning(game, prediction, confidence)
      }
    };
  }

  calculateProbability(odds) {
    // Converter odds em probabilidade (margem ajustada)
    const rawProb = (1 / odds) * 100;
    return Math.min(95, Math.max(5, rawProb * 0.95));
  }

  calculateFormScore(form) {
    if (!form) return 50;
    const points = { W: 3, D: 1, L: 0 };
    const total = form.reduce((sum, r) => sum + (points[r] || 0), 0);
    return Math.round((total / 15) * 100);
  }

  calculateOverUnder(game) {
    // Baseado nas odds e forma dos times
    const avgOdds = (game.homeOdds + game.awayOdds) / 2;
    let overProb = 55;
    
    if (avgOdds < 2) overProb = 62;
    else if (avgOdds < 2.5) overProb = 58;
    else if (avgOdds > 3) overProb = 48;
    
    return {
      over: overProb,
      under: 100 - overProb
    };
  }

  calculateBTTS(game) {
    // Ambas marcam
    const homeForm = this.calculateFormScore(game.homeForm);
    const awayForm = this.calculateFormScore(game.awayForm);
    
    let bttsProb = 50;
    if (homeForm > 60 && awayForm > 60) bttsProb = 65;
    else if (homeForm > 70 || awayForm > 70) bttsProb = 58;
    else if (homeForm < 40 || awayForm < 40) bttsProb = 42;
    
    return {
      yes: bttsProb,
      no: 100 - bttsProb
    };
  }

  calculateConfidence(homeProb, awayProb, homeForm, awayForm) {
    const probDiff = Math.abs(homeProb - awayProb);
    const formDiff = Math.abs(homeForm - awayForm);
    
    if (probDiff > 20 && formDiff > 20) return 'high';
    if (probDiff > 10 || formDiff > 15) return 'medium';
    return 'low';
  }

  getPrediction(homeProb, drawProb, awayProb, game) {
    const max = Math.max(homeProb, drawProb, awayProb);
    
    if (max === homeProb) {
      return {
        result: 'home',
        team: game.homeTeam,
        probability: Math.round(homeProb),
        text: `Vitória do ${game.homeTeam}`
      };
    } else if (max === awayProb) {
      return {
        result: 'away',
        team: game.awayTeam,
        probability: Math.round(awayProb),
        text: `Vitória do ${game.awayTeam}`
      };
    } else {
      return {
        result: 'draw',
        team: null,
        probability: Math.round(drawProb),
        text: 'Empate provável'
      };
    }
  }

  generateReasoning(game, prediction, confidence) {
    const reasons = [];
    
    // Fator casa
    if (game.homeOdds < game.awayOdds) {
      reasons.push(`${game.homeTeam} tem vantagem como mandante`);
    }
    
    // Forma recente
    const homeFormScore = this.calculateFormScore(game.homeForm);
    const awayFormScore = this.calculateFormScore(game.awayForm);
    
    if (homeFormScore > awayFormScore + 15) {
      reasons.push(`Forma recente favorece o ${game.homeTeam}`);
    } else if (awayFormScore > homeFormScore + 15) {
      reasons.push(`${game.awayTeam} em melhor momento`);
    }
    
    // H2H
    if (game.h2h) {
      const { homeWins, awayWins } = game.h2h;
      if (homeWins > awayWins + 2) {
        reasons.push('Histórico de confrontos favorável ao mandante');
      } else if (awayWins > homeWins + 2) {
        reasons.push('Visitante domina confronto direto');
      }
    }
    
    // Odds
    if (game.homeOdds < 1.8 || game.awayOdds < 1.8) {
      reasons.push('Odds indicam claro favorito');
    }

    return reasons.length > 0 ? reasons : ['Análise baseada em odds, forma e mando de campo'];
  }
}

export const aiAnalysisService = new AIAnalysisService();
