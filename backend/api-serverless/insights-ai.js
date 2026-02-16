/**
 * api/insights-ai.js
 * Rota serverless para gerar insights de IA usando OpenAI com dados reais da RapidAPI
 */

const OpenAI = require('openai');
const rapidApiClient = require('../services/rapidapi-client');

// Rate limiting simples (em memória)
const requestCounts = new Map();
const RATE_LIMIT = 10; // 10 requests por minuto
const RATE_WINDOW = 60000; // 1 minuto

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = requestCounts.get(userId) || [];
  
  // Limpar requisições antigas
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(userId, recentRequests);
  return true;
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { matchId, userId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: 'matchId é obrigatório' });
    }
    
    // Rate limiting
    if (userId && !checkRateLimit(userId)) {
      return res.status(429).json({ 
        error: 'Muitas requisições. Tente novamente em alguns segundos.',
        retryAfter: 60 
      });
    }
    
    console.log(`🔄 Buscando dados reais da partida ${matchId}...`);
    
    // Buscar dados reais da partida
    let matchData;
    try {
      matchData = await rapidApiClient.getMatchDetails(matchId);
    } catch (apiError) {
      console.error('❌ Erro ao buscar dados da partida:', apiError.message);
      return res.status(400).json({
        success: false,
        error: 'Erro ao buscar dados da partida',
        message: apiError.message
      });
    }
    
    // Verificar se tem API key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY não configurada, retornando fallback');
      return res.status(200).json(generateFallbackInsights(matchData));
    }
    
    // Inicializar OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('🤖 Gerando insights com OpenAI...');
    
    // Criar prompt estruturado
    const prompt = `Você é um especialista em análise de apostas esportivas. Analise a partida e forneça insights detalhados.

Contexto da Partida:
- Casa: ${matchData.home}
- Fora: ${matchData.away}
- Liga: ${matchData.league} (${matchData.country})
- Odds Casa: ${matchData.odds.home || 'N/A'}
- Odds Empate: ${matchData.odds.draw || 'N/A'}
- Odds Fora: ${matchData.odds.away || 'N/A'}
- Over 2.5: ${matchData.odds.over25 || 'N/A'}
- Ambas Marcam: ${matchData.odds.btts || 'N/A'}
${matchData.stats && Object.keys(matchData.stats).length > 0 ? `- Estatísticas: ${JSON.stringify(matchData.stats)}` : ''}
${matchData.h2h && matchData.h2h.length > 0 ? `- Últimos ${matchData.h2h.length} confrontos diretos` : ''}

Forneça uma análise estruturada em JSON com:
1. summary: resumo geral da partida (2-3 frases)
2. picks: array de 3-5 apostas recomendadas, cada uma com:
   - market: nome do mercado (ex: "Over 2.5", "Casa Vence", "Ambas Marcam")
   - confidence: número de 0-100 indicando confiança
   - reason: justificativa breve (1 frase)
3. bankroll: recomendação de gestão de banca (1 frase)

Responda APENAS com JSON válido, sem markdown ou texto adicional.`;

    // Chamar OpenAI com timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um analista de apostas esportivas especializado. Sempre responda em JSON válido.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      const responseText = completion.choices[0].message.content.trim();
      
      // Tentar parsear JSON
      let insights;
      try {
        // Remover possíveis markdown code blocks
        const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        insights = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta OpenAI:', responseText);
        return res.status(200).json(generateFallbackInsights(matchContext));
      }
      
      // Validar estrutura
      if (!insights.summary || !insights.picks || !insights.bankroll) {
        console.error('❌ Estrutura inválida da resposta OpenAI');
        return res.status(200).json(generateFallbackInsights(matchContext));
      }
      
      console.log('✅ Insights gerados com sucesso');
      
      return res.status(200).json({
        success: true,
        insights,
        source: 'openai'
      });
      
    } catch (openaiError) {
      clearTimeout(timeout);
      
      if (openaiError.name === 'AbortError') {
        console.error('⏱️ Timeout na OpenAI');
        return res.status(200).json(generateFallbackInsights(matchData));
      }
      
      throw openaiError;
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar insights:', error);
    
    // Retornar fallback em caso de erro
    const fallbackData = req.body.matchId ? { home: 'Time Casa', away: 'Time Fora' } : req.body.matchContext;
    return res.status(200).json(generateFallbackInsights(fallbackData));
  }
};

// Fallback quando OpenAI não está disponível
function generateFallbackInsights(matchData) {
  const homeOdds = matchData.odds?.home || matchData.homeOdds || 2.0;
  const awayOdds = matchData.odds?.away || matchData.awayOdds || 2.5;
  const home = matchData.home || matchData.homeTeam || 'Time Casa';
  const away = matchData.away || matchData.awayTeam || 'Time Fora';
  
  const favorito = homeOdds < awayOdds ? home : away;
  
  return {
    success: true,
    insights: {
      summary: `Partida equilibrada entre ${home} e ${away}. ${favorito} entra como ligeiro favorito segundo as odds. Considere o histórico e forma recente antes de apostar.`,
      picks: [
        {
          market: homeOdds < awayOdds ? `${home} Vence` : `${away} Vence`,
          confidence: 65,
          reason: 'Favorito segundo as odds e análise de forma recente'
        },
        {
          market: 'Over 2.5 Gols',
          confidence: 58,
          reason: 'Ambos os times têm capacidade ofensiva demonstrada'
        },
        {
          market: 'Ambas Marcam',
          confidence: 62,
          reason: 'Histórico recente indica gols de ambos os lados'
        }
      ],
      bankroll: 'Recomendado apostar 1-2% da banca total nesta partida, dado o nível de confiança moderado.'
    },
    source: 'fallback'
  };
}
