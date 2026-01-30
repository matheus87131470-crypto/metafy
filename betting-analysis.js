/**
 * SISTEMA DE ANÁLISE DE APOSTAS
 * Mock de IA para análise de jogos
 * Preparado para integração futura com backend
 */

class BettingAnalyzer {
    constructor() {
        this.riskLevels = {
            LOW: { label: 'Baixo', value: 'low', color: '#14b8a6' },
            MEDIUM: { label: 'Médio', value: 'medium', color: '#f59e0b' },
            HIGH: { label: 'Alto', value: 'high', color: '#ef4444' }
        };
    }

    /**
     * Analisa um bilhete de aposta e retorna recomendações
     * @param {Object} betData - Dados da aposta { team, type, odd, amount, notes }
     * @returns {Object} Análise com recomendações
     */
    analyze(betData) {
        const { team, type, odd, amount, notes } = betData;

        // Validação
        if (!team || !type || !odd || !amount) {
            return { error: 'Preencha todos os campos obrigatórios' };
        }

        // Conversão de tipos
        const oddNum = parseFloat(odd);
        const amountNum = parseFloat(amount);

        if (oddNum <= 0 || amountNum <= 0) {
            return { error: 'Odd e valor devem ser maiores que zero' };
        }

        // Cálculos básicos
        const potentialGain = amountNum * oddNum;
        const netProfit = potentialGain - amountNum;
        const roi = ((netProfit / amountNum) * 100).toFixed(1);

        // Análise de risco
        const riskLevel = this.calculateRiskLevel(oddNum, amountNum);

        // Análise de retorno esperado
        const returnAnalysis = this.analyzeReturn(oddNum, roi);

        // Estratégia e observações
        const strategy = this.generateStrategy(type, oddNum, riskLevel, notes);

        return {
            team,
            type,
            odd: oddNum,
            amount: amountNum,
            potentialGain: potentialGain.toFixed(2),
            netProfit: netProfit.toFixed(2),
            roi: roi,
            riskLevel: riskLevel,
            returnAnalysis: returnAnalysis,
            strategy: strategy,
            observations: this.generateObservations(oddNum, amountNum, type)
        };
    }

    /**
     * Calcula o nível de risco baseado na odd e valor
     */
    calculateRiskLevel(odd, amount) {
        // Odd > 3.0 = Alto risco (baixa probabilidade)
        if (odd > 3.0) {
            return this.riskLevels.HIGH;
        }
        // Odd entre 1.5 e 3.0 = Médio
        else if (odd >= 1.5) {
            return this.riskLevels.MEDIUM;
        }
        // Odd < 1.5 = Baixo (alta probabilidade, baixo retorno)
        else {
            return this.riskLevels.LOW;
        }
    }

    /**
     * Análise de retorno esperado
     */
    analyzeReturn(odd, roi) {
        if (roi > 100) {
            return 'Excelente retorno potencial, mas maior risco';
        } else if (roi >= 50) {
            return 'Bom retorno com risco moderado';
        } else if (roi >= 25) {
            return 'Retorno razoável com risco controlado';
        } else if (roi > 0) {
            return 'Retorno conservador com baixo risco';
        } else {
            return 'Análise personalizada baseada nos parâmetros';
        }
    }

    /**
     * Gera recomendações de estratégia
     */
    generateStrategy(type, odd, riskLevel, notes) {
        let strategy = '';

        // Baseado no tipo de aposta
        if (type === 'vitoria') {
            strategy = 'Aposte em vitórias com odds menores (1.5-2.0) para maior consistência. Odds acima de 2.5 requerem pesquisa profunda.';
        } else if (type === 'empate') {
            strategy = 'Empates oferecem odds médias (2.5-3.5). Combine com análise de tendências defensivas dos times.';
        } else if (type === 'totaliza') {
            strategy = 'Analise histórico de gols da temporada. Odds de 1.8-2.2 tendem a ser mais previsíveis.';
        } else if (type === 'desfavor') {
            strategy = 'Apostas em desfavoritos requerem significante pesquisa e gerenciamento de bankroll agressivo.';
        }

        // Ajustes por risco
        if (riskLevel.value === 'high') {
            strategy += ' ⚠️ Reduza o tamanho da aposta para preservar capital.';
        } else if (riskLevel.value === 'low') {
            strategy += ' ✓ Risco controlado permite aumentar exposição gradualmente.';
        }

        return strategy;
    }

    /**
     * Gera observações e avisos
     */
    generateObservations(odd, amount, type) {
        const observations = [];

        // Verificação de bankroll
        if (amount > 1000) {
            observations.push('Aposta superior a R$ 1.000 - Considere reduzir para melhor gerenciamento de risco');
        }

        // Verificação de odds
        if (odd > 4.0) {
            observations.push('Odds muito altas (>4.0) indicam baixa probabilidade - Requer análise profunda');
        } else if (odd < 1.2) {
            observations.push('Odds muito baixas (<1.2) oferecem pouco retorno mesmo com alta probabilidade');
        }

        // Recomendação de ROI
        const roi = ((amount * odd - amount) / amount * 100);
        if (roi > 200) {
            observations.push('ROI acima de 200% indica aposta especulativa - Use com cautela');
        }

        // Avisos gerais
        observations.push('Apostas esportivas envolvem risco - Nunca aposte dinheiro que não pode perder');
        observations.push('Gerencie seu bankroll: limite apostas a 5% do capital total por bilhete');

        return observations;
    }

    /**
     * Valida dados de entrada
     */
    validateBetData(betData) {
        const errors = [];

        if (!betData.team?.trim()) {
            errors.push('Time/Evento é obrigatório');
        }
        if (!betData.type) {
            errors.push('Tipo de aposta é obrigatório');
        }
        if (!betData.odd || parseFloat(betData.odd) <= 0) {
            errors.push('Odd deve ser um número maior que zero');
        }
        if (!betData.amount || parseFloat(betData.amount) <= 0) {
            errors.push('Valor deve ser um número maior que zero');
        }

        return errors;
    }
}

// Exportar para uso global
window.BettingAnalyzer = BettingAnalyzer;
