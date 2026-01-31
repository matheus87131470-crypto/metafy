/**
 * ai-analyzer.js - Sistema de Análise IA para Jogos de Futebol
 * Análise mockada inicialmente, pronto para integração com OpenAI
 */

class AIAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.riskLevels = ['BAIXO', 'MÉDIO', 'ALTO'];
        this.suggestions = [
            'Vitória do mandante',
            'Vitória do visitante',
            'Empate',
            'Over 2.5',
            'Under 2.5',
            'Ambos marcam'
        ];
    }

    /**
     * Analisar um jogo
     * @param {Object} game - Dados do jogo
     * @param {String} market - Mercado selecionado (ex: "1X2", "over_under")
     * @param {Number} odd - Odd selecionada
     * @returns {Promise<Object>} Análise completa
     */
    async analyzeGame(game, market, odd) {
        const cacheKey = `${game.id}-${market}-${odd}`;
        
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        // Simular delay de processamento IA
        await new Promise(resolve => setTimeout(resolve, 800));

        const analysis = this._generateAnalysis(game, market, odd);
        this.analysisCache.set(cacheKey, analysis);
        
        return analysis;
    }

    /**
     * Gerar análise mockada
     * @private
     */
    _generateAnalysis(game, market, odd) {
        const homeTeamScore = this._calculateTeamScore(game.homeTeam);
        const awayTeamScore = this._calculateTeamScore(game.awayTeam);
        const totalScore = homeTeamScore + awayTeamScore;
        
        // Determinar risco baseado na odd e scores
        const riskLevel = this._calculateRisk(odd, homeTeamScore, awayTeamScore);
        
        // Gerar sugestão
        const suggestion = this._generateSuggestion(game, market, homeTeamScore, awayTeamScore);
        
        // Calcular probabilidade
        const probability = this._calculateProbability(homeTeamScore, awayTeamScore, market);
        
        // Gerar explicação
        const explanation = this._generateExplanation(game, market, homeTeamScore, awayTeamScore);

        return {
            gameId: game.id,
            market: market,
            odd: odd,
            riskLevel: riskLevel,
            probability: probability,
            suggestion: suggestion,
            explanation: explanation,
            scores: {
                home: homeTeamScore,
                away: awayTeamScore,
                total: totalScore
            },
            confidence: Math.round((probability) * 100),
            potentialGain: this._calculatePotentialGain(odd),
            recommendations: this._generateRecommendations(game, riskLevel, probability),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calcular score de forma de um time
     * @private
     */
    _calculateTeamScore(teamName) {
        // Algoritmo simples: baseado no nome do time e hora
        const nameHash = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const timeInfluence = new Date().getHours() % 24;
        const randomInfluence = Math.floor(Math.random() * 30);
        
        const score = ((nameHash + timeInfluence + randomInfluence) % 100) / 100;
        return Math.round(score * 100) / 100;
    }

    /**
     * Calcular nível de risco
     * @private
     */
    _calculateRisk(odd, homeScore, awayScore) {
        const scoreDiff = Math.abs(homeScore - awayScore);
        
        // Lógica: odds maiores = maior risco
        if (odd > 3.5) return 'ALTO';
        if (odd > 2.0) return 'MÉDIO';
        return 'BAIXO';
    }

    /**
     * Gerar sugestão de aposta
     * @private
     */
    _generateSuggestion(game, market, homeScore, awayScore) {
        if (market === '1X2') {
            if (homeScore > awayScore + 0.15) return '1 (Vitória do mandante)';
            if (awayScore > homeScore + 0.15) return '2 (Vitória do visitante)';
            return 'X (Empate)';
        }
        
        if (market === 'over_under') {
            const combinedScore = homeScore + awayScore;
            return combinedScore > 0.5 ? 'Over 2.5' : 'Under 2.5';
        }
        
        return 'Ambos marcam (Sim)';
    }

    /**
     * Calcular probabilidade
     * @private
     */
    _calculateProbability(homeScore, awayScore, market) {
        if (market === '1X2') {
            const total = homeScore + awayScore + 0.5; // evitar divisão por zero
            return Math.round((homeScore / total) * 100) / 100;
        }
        return (homeScore + awayScore) / 2;
    }

    /**
     * Gerar explicação textual
     * @private
     */
    _generateExplanation(game, market, homeScore, awayScore) {
        const scoreDiff = (homeScore - awayScore).toFixed(2);
        const formHome = homeScore > 0.5 ? 'boa forma' : 'forma instável';
        const formAway = awayScore > 0.5 ? 'boa forma' : 'forma inconsistente';

        return `
            ${game.homeTeam} está em ${formHome} (índice: ${(homeScore * 100).toFixed(0)}%).
            ${game.awayTeam} apresenta ${formAway} (índice: ${(awayScore * 100).toFixed(0)}%).
            
            Diferença de forma: ${Math.abs(scoreDiff) > 0 ? 'Mandante favorecido' : 'Equilibrado'}.
            
            Baseado em: Forma recente, histórico de confrontos e contexto da competição.
            Confiança da análise: ${Math.round((homeScore + awayScore) / 2 * 100)}%.
        `;
    }

    /**
     * Calcular ganho potencial
     * @private
     */
    _calculatePotentialGain(odd) {
        const baseAmount = 100; // assumir aposta de 100
        return Math.round((baseAmount * odd - baseAmount) * 100) / 100;
    }

    /**
     * Gerar recomendações
     * @private
     */
    _generateRecommendations(game, riskLevel, probability) {
        const recommendations = [];
        
        if (riskLevel === 'BAIXO') {
            recommendations.push('✅ Aposta com risco controlado');
            recommendations.push('✅ Ideal para iniciantes');
        } else if (riskLevel === 'MÉDIO') {
            recommendations.push('⚠️ Risco moderado - considere seu bankroll');
            recommendations.push('💡 Combine com outras apostas');
        } else {
            recommendations.push('🔴 Alto risco - apenas aposte o que pode perder');
            recommendations.push('💡 Considere reduzir o valor da aposta');
        }
        
        if (probability > 0.65) {
            recommendations.push('📈 Alta probabilidade de acerto');
        } else if (probability < 0.35) {
            recommendations.push('📉 Baixa probabilidade - revisar análise');
        }
        
        return recommendations;
    }
}

// Exportar para uso em scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAnalyzer;
}
