/**
 * ai-prompts.js - Prompts da IA para análise de futebol
 */

const FOOTBALL_ANALYSIS_PROMPT = (gameData) => {
  return `Você é um especialista em análise de futebol e apostas esportivas. Faça uma análise profissional do seguinte jogo:

Jogo: ${gameData.homeTeam} x ${gameData.awayTeam}
Competição: ${gameData.competition}
Mercado de Aposta: ${gameData.market}
Odd oferecida: ${gameData.odd}
Valor da aposta: R$ ${gameData.amount}

Forneça uma análise em JSON válido com a seguinte estrutura (RESPONDA APENAS COM JSON, sem markdown):
{
  "contexto": "Análise do contexto do confronto em 1-2 linhas",
  "forma": {
    "homeTeam": "Descrição da forma do time da casa",
    "awayTeam": "Descrição da forma do time visitante",
    "comparacao": "Comparação entre os times"
  },
  "risco": "LOW" | "MEDIUM" | "HIGH",
  "risco_descricao": "Explicação do nível de risco em 1 linha",
  "observacoes": [
    "Observação técnica 1",
    "Observação técnica 2",
    "Observação técnica 3"
  ],
  "ganho_potencial": ${gameData.amount * gameData.odd},
  "roi": ${((gameData.amount * gameData.odd - gameData.amount) / gameData.amount * 100).toFixed(1)},
  "recomendacao": "Recomendação final baseada na análise"
}

Seja profissional, técnico e realista na análise.`;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FOOTBALL_ANALYSIS_PROMPT };
}
