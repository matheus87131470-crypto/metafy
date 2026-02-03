/**
 * ai-analyzer.js - Sistema de Análise IA com Backend Real
 * Integrado com Backend Node.js em Produção (Render.com)
 * Versão: 3.0.0 - IA Real OpenAI GPT-4o-mini
 */

class AIAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.apiEndpoint = "https://metafy-backend.onrender.com/api/analyze";
        this.timeoutDuration = 30000; // 30 segundos
    }

    /**
     * Analisar um jogo com IA Real
     * @param {Object} game - Dados do jogo
     * @param {String} market - Mercado selecionado
     * @param {Number} odd - Odd selecionada
     * @param {Number} amount - Valor da aposta
     * @param {String} notes - Notas adicionais
     * @returns {Promise<Object>} Análise da IA Real
     */
    async analyzeGame(game, market, odd, amount = 100, notes = '') {
        const cacheKey = `${game.id || game.homeTeam}-${market}-${odd}`;
        
        // Retornar do cache se existir
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        try {
            // Montar payload para IA
            const payload = {
                home: game.homeTeam || game.home,
                away: game.awayTeam || game.away,
                competition: game.competition || 'Futebol',
                market: market,
                odd: parseFloat(odd),
                stake: parseFloat(amount),
                notes: notes
            };

            // Chamar IA Real
            const analysis = await this._analyzeWithRealAI(payload);
            
            // Cachear resultado
            this.analysisCache.set(cacheKey, analysis);
            
            return analysis;
        } catch (error) {
            console.error('Erro ao analisar com IA Real:', error);
            
            // Fallback: retornar análise simples
            return this._generateFallbackAnalysis(game, market, odd, amount);
        }
    }

    /**
     * Chamar a IA Real do Backend
     * @private
     */
    async _analyzeWithRealAI(payload) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

        try {
            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.analysis) {
                throw new Error('Resposta inválida da IA');
            }

            // Parsear resposta da IA
            return this._parseAIResponse(data.analysis, payload);
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Parsear resposta da IA em estrutura compatível
     * @private
     */
    _parseAIResponse(aiText, payload) {
        return {
            source: 'api',
            rawAnalysis: aiText,
            gameInfo: {
                home: payload.home,
                away: payload.away,
                competition: payload.competition,
                market: payload.market,
                odd: payload.odd,
                stake: payload.stake
            },
            potentialGain: (payload.stake * payload.odd) - payload.stake,
            roi: ((payload.stake * payload.odd - payload.stake) / payload.stake * 100).toFixed(1),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Análise Fallback (sem acesso à IA Real)
     * @private
     */
    _generateFallbackAnalysis(game, market, odd, amount) {
        return {
            source: 'fallback',
            gameInfo: {
                home: game.homeTeam || game.home,
                away: game.awayTeam || game.away,
                competition: game.competition || 'Futebol',
                market: market,
                odd: odd,
                stake: amount
            },
            rawAnalysis: `
                ⚠️ ANÁLISE LOCAL (IA Real indisponível)
                
                ${game.homeTeam || game.home} vs ${game.awayTeam || game.away}
                
                Esta análise é gerada localmente e pode não refletir dados atualizados.
                
                📊 Informações da Aposta:
                • Mercado: ${market}
                • Odd: ${odd}
                • Valor: R$ ${parseFloat(amount).toFixed(2)}
                • Ganho Potencial: R$ ${((amount * odd) - amount).toFixed(2)}
                
                ⚠️ Para análise completa com IA Real, verifique a conexão com o backend.
            `,
            potentialGain: (amount * odd) - amount,
            roi: ((amount * odd - amount) / amount * 100).toFixed(1),
            timestamp: new Date().toISOString()
        };
    }
}
