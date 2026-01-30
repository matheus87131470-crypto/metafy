/**
 * ANALISADOR DE FUTEBOL - ANÁLISE IA DE PARTIDAS
 * Simulação de IA para análise estratégica de jogos de futebol
 * Preparado para integração com API de IA real (OpenAI, Claude, etc)
 */

class FootballAnalyzer {
    constructor() {
        // Base de dados simulada de times e formas
        this.competitions = {
            'brasileirao': 'Campeonato Brasileiro',
            'copa-do-brasil': 'Copa do Brasil',
            'libertadores': 'Copa Libertadores',
            'sulamericana': 'Copa Sul-Americana',
            'champions': 'Champions League',
            'europa-league': 'Europa League',
            'serie-b': 'Série B',
            'estadual': 'Campeonato Estadual',
            'amistoso': 'Amistoso'
        };

        this.markets = {
            'vencedor': 'Vencedor da Partida',
            'ambas': 'Ambas Marcam',
            'over25': 'Over 2.5 Gols',
            'under25': 'Under 2.5 Gols',
            'resultado': '1x2 (Resultado)',
            'handicap': 'Handicap',
            'primeiro-gol': 'Primeiro Gol',
            'cartoes': 'Cartões',
            'escanteios': 'Escanteios'
        };

        this.riskLevels = {
            LOW: { label: 'Baixo', value: 'low', emoji: '🟢', description: 'Aposta segura, probabilidade alta' },
            MEDIUM: { label: 'Médio', value: 'medium', emoji: '🟡', description: 'Aposta moderada, risco calculado' },
            HIGH: { label: 'Alto', value: 'high', emoji: '🔴', description: 'Aposta arriscada, probabilidade baixa' }
        };
    }

    /**
     * Analisa uma partida de futebol
     * @param {Object} gameData - Dados do jogo { home, away, competition, market, odd, amount }
     * @returns {Object} Análise completa com recomendações
     */
    analyze(gameData) {
        const { home, away, competition, market, odd, amount } = gameData;

        // Validações
        const errors = this.validateGameData(gameData);
        if (errors.length > 0) {
            return { error: errors[0] };
        }

        const oddNum = parseFloat(odd);
        const amountNum = parseFloat(amount);

        // Cálculos financeiros
        const potentialGain = amountNum * oddNum;
        const netProfit = potentialGain - amountNum;
        const roi = ((netProfit / amountNum) * 100).toFixed(1);

        // Análise específica de futebol
        const formAnalysis = this.analyzeTeamForm(home, away);
        const riskLevel = this.calculateFootballRisk(market, oddNum);
        const gameContext = this.analyzeGameContext(home, away, competition, market);
        const strategy = this.generateFootballStrategy(market, riskLevel, gameContext);
        const observations = this.generateFootballObservations(oddNum, amountNum, market, riskLevel);

        return {
            // Dados da aposta
            homeTeam: home,
            awayTeam: away,
            competition: this.competitions[competition] || competition,
            market: this.markets[market] || market,
            odd: oddNum,
            amount: amountNum,

            // Análise financeira
            potentialGain: potentialGain.toFixed(2),
            netProfit: netProfit.toFixed(2),
            roi: roi,

            // Análise de futebol
            formAnalysis: formAnalysis,
            gameContext: gameContext,
            riskLevel: riskLevel,

            // Estratégia
            strategy: strategy,
            observations: observations,

            // Recomendação final
            recommendation: this.generateRecommendation(riskLevel, roi, gameContext)
        };
    }

    /**
     * Analisa a forma dos times
     */
    analyzeTeamForm(home, away) {
        // Simulação: em produção, isso viria de uma API
        const homeForm = this.generateFormData();
        const awayForm = this.generateFormData();

        return {
            home: {
                team: home,
                recentForm: homeForm.form, // "VVVDD" (Vitória/Derrota)
                description: homeForm.description,
                trend: homeForm.trend
            },
            away: {
                team: away,
                recentForm: awayForm.form,
                description: awayForm.description,
                trend: awayForm.trend
            },
            comparison: this.compareTeams(homeForm, awayForm)
        };
    }

    /**
     * Gera dados simulados de forma
     */
    generateFormData() {
        const forms = ['VVVVV', 'VVVVD', 'VVVDD', 'VVDDD', 'DDDDD'];
        const form = forms[Math.floor(Math.random() * forms.length)];
        
        const descriptionMap = {
            'VVVVV': 'Excelente forma - 5 vitórias',
            'VVVVD': 'Muito bom - 4 vitórias, 1 derrota',
            'VVVDD': 'Bom - 3 vitórias, 2 derrotas',
            'VVDDD': 'Instável - 2 vitórias, 3 derrotas',
            'DDDDD': 'Péssima forma - 5 derrotas'
        };

        const trendMap = {
            'VVVVV': '📈 Ascendente',
            'VVVVD': '📈 Ascendente',
            'VVVDD': '➡️ Estável',
            'VVDDD': '📉 Descendente',
            'DDDDD': '📉 Descendente'
        };

        return {
            form: form,
            description: descriptionMap[form],
            trend: trendMap[form]
        };
    }

    /**
     * Compara os times
     */
    compareTeams(homeForm, awayForm) {
        const homeWins = (homeForm.form.match(/V/g) || []).length;
        const awayWins = (awayForm.form.match(/V/g) || []).length;

        if (homeWins > awayWins) {
            return `${homeForm.team} está em melhor forma`;
        } else if (awayWins > homeWins) {
            return `${awayForm.team} está em melhor forma`;
        } else {
            return 'Ambos em forma equivalente';
        }
    }

    /**
     * Analisa contexto do jogo
     */
    analyzeGameContext(home, away, competition, market) {
        const competitionData = {
            'brasileirao': { importance: 'Alto', level: 'Nacional' },
            'champions': { importance: 'Crítico', level: 'Internacional' },
            'libertadores': { importance: 'Crítico', level: 'Continental' },
            'estadual': { importance: 'Médio', level: 'Estadual' }
        };

        const compData = competitionData[competition] || { importance: 'Médio', level: 'Variável' };

        return {
            competition: competition,
            importance: compData.importance,
            level: compData.level,
            historicalContext: 'Baseado em últimos 5 jogos',
            details: this.generateContextDetails(market)
        };
    }

    /**
     * Gera detalhes de contexto
     */
    generateContextDetails(market) {
        const details = {
            'vencedor': 'Favorito tem estatisticamente maior chance de vitória',
            'ambas': 'Análise baseada em capacidade ofensiva e defensiva',
            'over25': 'Considera padrão de gols na temporada',
            'under25': 'Defesas atuando bem reduzem chance de muitos gols',
            'resultado': 'Manda de campo pode ser decisiva',
            'handicap': 'Equilíbrio competitivo em foco',
            'primeiro-gol': 'Análise de velocidade e qualidade ofensiva',
            'cartoes': 'Histórico disciplinar dos times considerado',
            'escanteios': 'Estilo tático de cada equipe avaliado'
        };

        return details[market] || 'Análise de mercado específica';
    }

    /**
     * Calcula risco específico para futebol
     */
    calculateFootballRisk(market, odd) {
        // Algoritmo de risco ajustado para futebol
        if (market === 'vencedor' || market === 'resultado') {
            // Mercados principais
            if (odd < 1.5) return this.riskLevels.LOW;
            if (odd >= 1.5 && odd < 3.5) return this.riskLevels.MEDIUM;
            return this.riskLevels.HIGH;
        } else if (market === 'over25' || market === 'under25') {
            // Mercados de total
            if (odd < 1.8) return this.riskLevels.LOW;
            if (odd >= 1.8 && odd < 3.0) return this.riskLevels.MEDIUM;
            return this.riskLevels.HIGH;
        } else if (market === 'ambas') {
            // Mercado BTTS
            if (odd < 1.6) return this.riskLevels.LOW;
            if (odd >= 1.6 && odd < 2.8) return this.riskLevels.MEDIUM;
            return this.riskLevels.HIGH;
        } else {
            // Outros mercados
            if (odd < 2.0) return this.riskLevels.LOW;
            if (odd >= 2.0 && odd < 4.0) return this.riskLevels.MEDIUM;
            return this.riskLevels.HIGH;
        }
    }

    /**
     * Gera estratégia específica para futebol
     */
    generateFootballStrategy(market, riskLevel, gameContext) {
        const strategies = {
            'vencedor': {
                low: 'Aposte no favorito. Manda de campo e forma atual justificam a baixa odd.',
                medium: 'Analise tendências recentes. O time pode estar subestimado pela casa.',
                high: 'Evite apostas em outsiders. Risco muito elevado para retorno incerto.'
            },
            'ambas': {
                low: 'Parcialmente recomendado. Ambos times têm capacidade ofensiva comprovada.',
                medium: 'Considere o estilo tático. Times defensivos podem não confirmar ambas marcam.',
                high: 'Alto risco. Apenas um dos times pode balançar a rede.'
            },
            'over25': {
                low: 'Histórico de gols favorece over. Ambos times com ataques potentes.',
                medium: 'Possível, mas defesas competentes podem manter baixo. Analise estatísticas.',
                high: 'Evite. Defesas solidárias tendem a manter under 2.5.'
            },
            'under25': {
                low: 'Defensivamente fortes. Poucos gols na temporada justificam under.',
                medium: 'Possível dependendo da estratégia. Analisar composição do time.',
                high: 'Evite. Ofensivas fortes podem facilmente marcar 3+.'
            }
        };

        const baseStrategy = strategies[market] || {};
        return baseStrategy[riskLevel.value] || 'Analise com cuidado. Mercado específico requer pesquisa.';
    }

    /**
     * Gera observações específicas para futebol
     */
    generateFootballObservations(odd, amount, market, riskLevel) {
        const observations = [];

        // Observações por mercado
        if (market === 'vencedor' || market === 'resultado') {
            observations.push('✓ Manda de campo: Fator importante - Times em casa vencem 50-55% das vezes');
            observations.push('✓ Ausências: Verifique lesões de jogadores-chave antes de apostar');
        }

        if (market === 'ambas') {
            observations.push('✓ Eficiência ofensiva: Ambos precisam estar criando chances consistentes');
            observations.push('✓ Contexto: Derbis e clássicos podem ser defensivos, reduzindo chance');
        }

        if (market === 'over25' || market === 'under25') {
            observations.push('✓ Histórico de gols: Analise média de gols dos últimos 10 jogos');
            observations.push('✓ Estilo tático: Alguns times priorizam defesa, resultando em poucos gols');
        }

        // Observações por risco
        if (riskLevel.value === 'high') {
            observations.push('⚠️ RISCO ELEVADO: Limite sua aposta a 2-3% do bankroll');
            observations.push('⚠️ Variance: Mesmo análises boas têm taxa de acerto de 55-60%');
        } else if (riskLevel.value === 'medium') {
            observations.push('⚠️ Risco moderado: Aposte 5% do bankroll máximo');
        } else {
            observations.push('✓ Baixo risco: Pode aumentar para 5-10% do bankroll');
        }

        // Observações financeiras
        if (amount > 1000) {
            observations.push('💡 Valor elevado: Considere distribuir em múltiplas apostas');
        }

        if (odd > 5) {
            observations.push('⚠️ Odd muito alta: Indica probabilidade baixa. Alto risco de perda.');
        }

        // Observações gerais
        observations.push('💡 Nunca aposte em jogos que você não conhece bem');
        observations.push('💡 Evite apostas em competições menores ou ligas desconhecidas');
        observations.push('💡 Futebol tem variância alta - gerenciamento de bankroll é crítico');
        observations.push('⚖️ Esta análise é simulada. Realidade pode ser diferente.');

        return observations;
    }

    /**
     * Gera recomendação final
     */
    generateRecommendation(riskLevel, roi, gameContext) {
        if (riskLevel.value === 'low' && roi > 20) {
            return '✅ RECOMENDADO: Aposta com bom retorno e risco controlado';
        } else if (riskLevel.value === 'low') {
            return '✅ POSSÍVEL: Baixo risco, mas retorno pequeno';
        } else if (riskLevel.value === 'medium' && roi > 50) {
            return '⚠️ CONSIDERE: Risco moderado com retorno interessante';
        } else if (riskLevel.value === 'medium') {
            return '⚠️ CUIDADO: Risco moderado com retorno limitado';
        } else {
            return '❌ NÃO RECOMENDADO: Risco elevado demanda muito maior retorno';
        }
    }

    /**
     * Valida dados da aposta
     */
    validateGameData(gameData) {
        const errors = [];

        if (!gameData.home?.trim()) {
            errors.push('Time da casa é obrigatório');
        }
        if (!gameData.away?.trim()) {
            errors.push('Time visitante é obrigatório');
        }
        if (!gameData.competition) {
            errors.push('Competição é obrigatória');
        }
        if (!gameData.market) {
            errors.push('Mercado é obrigatório');
        }
        if (!gameData.odd || parseFloat(gameData.odd) <= 0) {
            errors.push('Odd deve ser um número maior que zero');
        }
        if (!gameData.amount || parseFloat(gameData.amount) <= 0) {
            errors.push('Valor deve ser um número maior que zero');
        }

        return errors;
    }
}

// Exportar para uso global
window.FootballAnalyzer = FootballAnalyzer;
