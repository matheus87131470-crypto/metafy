/**
 * football-analyzer.js - IA para Análise de Futebol
 * Gera análises simuladas para partidas
 */

class FootballAnalyzer {
    constructor() {
        this.markets = {
            'vencedor': {
                label: 'Vencedor (1x2)',
                riskThresholds: { low: 1.50, high: 3.50 }
            },
            'ambas': {
                label: 'Ambas Marcam',
                riskThresholds: { low: 1.60, high: 2.50 }
            },
            'over25': {
                label: 'Over 2.5 Gols',
                riskThresholds: { low: 1.80, high: 2.20 }
            },
            'under25': {
                label: 'Under 2.5 Gols',
                riskThresholds: { low: 1.70, high: 2.00 }
            },
            'resultado': {
                label: 'Resultado Exato',
                riskThresholds: { low: 5.00, high: 15.00 }
            },
            'handicap': {
                label: 'Handicap',
                riskThresholds: { low: 1.80, high: 2.50 }
            },
            'primeiro-gol': {
                label: 'Primeiro Gol',
                riskThresholds: { low: 2.00, high: 3.50 }
            },
            'cartoes': {
                label: 'Total de Cartões',
                riskThresholds: { low: 1.90, high: 2.30 }
            },
            'escanteios': {
                label: 'Total de Escanteios',
                riskThresholds: { low: 1.85, high: 2.15 }
            }
        };
    }

    analyze(gameData) {
        const { homeTeam, awayTeam, competition, market, odd, amount } = gameData;
        
        // Validar dados
        if (!homeTeam || !awayTeam || !market || !odd || !amount) {
            return { error: 'Dados incompletos para análise' };
        }

        // Determinar risco
        const riskLevel = this.calculateRisk(market, odd);
        
        // Gerar análise
        const analysis = {
            homeTeam,
            awayTeam,
            competition,
            market: this.markets[market]?.label || market,
            odd,
            amount,
            riskLevel,
            riskEmoji: this.getRiskEmoji(riskLevel),
            
            // Contexto do jogo
            context: this.generateContext(homeTeam, awayTeam, competition),
            
            // Forma dos times
            form: this.generateFormAnalysis(homeTeam, awayTeam),
            
            // Observações técnicas
            observations: this.generateObservations(market, riskLevel),
            
            // Cálculos financeiros
            potentialGain: (amount * odd).toFixed(2),
            roi: ((amount * odd - amount) / amount * 100).toFixed(1),
            
            // Recomendação
            recommendation: this.generateRecommendation(riskLevel, odd, amount)
        };

        return analysis;
    }

    calculateRisk(market, odd) {
        const thresholds = this.markets[market]?.riskThresholds || 
                          { low: 1.80, high: 3.00 };
        
        if (odd < thresholds.low) return 'LOW';
        if (odd > thresholds.high) return 'HIGH';
        return 'MEDIUM';
    }

    getRiskEmoji(riskLevel) {
        const emojis = {
            'LOW': '🟢',
            'MEDIUM': '🟡',
            'HIGH': '🔴'
        };
        return emojis[riskLevel] || '⚪';
    }

    generateContext(homeTeam, awayTeam, competition) {
        const contexts = [
            `${homeTeam} enfrenta ${awayTeam} em jogo importante pela ${competition}.`,
            `Confronto direto entre ${homeTeam} e ${awayTeam} na ${competition}.`,
            `${homeTeam} recebe ${awayTeam} em partida decisiva da ${competition}.`,
            `Clássico entre ${homeTeam} e ${awayTeam} pela ${competition}.`
        ];
        return contexts[Math.floor(Math.random() * contexts.length)];
    }

    generateFormAnalysis(homeTeam, awayTeam) {
        const forms = ['4V-1D', '3V-2D', '2V-2D-1E', '5V', '3V-1D-1E'];
        const homeForm = forms[Math.floor(Math.random() * forms.length)];
        const awayForm = forms[Math.floor(Math.random() * forms.length)];
        
        let comparison = '';
        if (homeForm.includes('5V')) {
            comparison = `${homeTeam} em melhor forma. ${awayTeam} em recuperação.`;
        } else if (awayForm.includes('5V')) {
            comparison = `${awayTeam} em excelente momento. ${homeTeam} precisa melhorar.`;
        } else {
            comparison = `Equipes em bom nível técnico. Jogo equilibrado.`;
        }

        return {
            homeForm,
            awayForm,
            comparison
        };
    }

    generateObservations(market, riskLevel) {
        const observations = [];

        // Observações por mercado
        if (market === 'vencedor') {
            observations.push('Analise o histórico recente entre os times.');
            observations.push('Manda de campo é fator importante em futebol.');
        } else if (market === 'ambas') {
            observations.push('Times com ataques fortes costumam levar gols.');
            observations.push('Defesas frágeis aumentam chance de ambas marcarem.');
        } else if (market.includes('over') || market.includes('under')) {
            observations.push('Estilo de jogo das equipes é determinante.');
            observations.push('Condições climáticas podem afetar o número de gols.');
        } else if (market === 'resultado') {
            observations.push('Aposte em resultados exatos com cautela.');
            observations.push('Odds altas indicam baixa probabilidade.');
        }

        // Observações por risco
        if (riskLevel === 'LOW') {
            observations.push('Aposta mais segura com probabilidade maior de ganho.');
        } else if (riskLevel === 'MEDIUM') {
            observations.push('Risco moderado. Aposte 5-10% do seu bankroll.');
        } else {
            observations.push('Alto risco. Aposte no máximo 2-3% do bankroll.');
        }

        return observations;
    }

    generateRecommendation(riskLevel, odd, amount) {
        if (riskLevel === 'LOW') {
            return `✅ RECOMENDADO - Aposta segura com probabilidade favorável. Odd ${odd} é interessante para este mercado.`;
        } else if (riskLevel === 'MEDIUM') {
            return `⚠️ CONSIDERE - Risco moderado. Faça a aposta se você tiver confiança na análise.`;
        } else {
            return `🔴 ALTO RISCO - Apenas apostadores experientes. Odds altas indicam baixa probabilidade de ganho.`;
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}
