/**
 * api/analyze.js - Endpoint Serverless para Análise com OpenAI
 * POST /api/analyze
 */

const { FOOTBALL_ANALYSIS_PROMPT } = require('../services/ai-prompts');

module.exports = async (req, res) => {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { homeTeam, awayTeam, competition, market, odd, amount } = req.body;

    // Validar dados
    if (!homeTeam || !awayTeam || !competition || !market || !odd || !amount) {
      return res.status(400).json({ 
        error: 'Dados incompletos para análise' 
      });
    }

    // Construir prompt
    const gameData = { homeTeam, awayTeam, competition, market, odd, amount };
    const prompt = FOOTBALL_ANALYSIS_PROMPT(gameData);

    // Chamar OpenAI
    const analysisResponse = await callOpenAI(prompt);

    if (!analysisResponse) {
      return res.status(500).json({ 
        error: 'Erro ao gerar análise com IA' 
      });
    }

    return res.status(200).json({
      success: true,
      analysis: analysisResponse
    });
  } catch (error) {
    console.error('Erro no endpoint /api/analyze:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

/**
 * Chama OpenAI API
 */
async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OPENAI_API_KEY não configurada, usando fallback');
    return generateFallbackAnalysis(prompt);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de futebol. Sempre responda com JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Tentar fazer parse do JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // Se falhar, retornar como texto formatado
      return {
        contexto: content.substring(0, 200),
        risco: 'MEDIUM',
        observacoes: [content],
        recomendacao: 'Análise disponível acima'
      };
    }
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    return generateFallbackAnalysis(prompt);
  }
}

/**
 * Gera análise de fallback (simulada)
 */
function generateFallbackAnalysis(prompt) {
  return {
    contexto: 'Análise simulada gerada como fallback (API não disponível)',
    forma: {
      homeTeam: 'Em boa forma nos últimos jogos',
      awayTeam: 'Recuperando-se de resultados anteriores',
      comparacao: 'Time da casa tem ligeira vantagem'
    },
    risco: 'MEDIUM',
    risco_descricao: 'Aposta com risco moderado, equilíbrio entre segurança e retorno',
    observacoes: [
      'Manda de campo favorece o time da casa',
      'Histórico recente mostra bom desempenho',
      'Defesa do visitante tem potencial de melhora'
    ],
    ganho_potencial: 0,
    roi: 0,
    recomendacao: '⚠️ CONSIDERE - Risco moderado, faça análise adicional antes de apostar'
  };
}
