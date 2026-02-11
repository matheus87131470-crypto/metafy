/**
 * API Route: /api/ai/analyze-fixtures
 * Análise personalizada de IA para usuários Premium
 * 
 * POST Body:
 * {
 *   "fixtures": [
 *     { "fixture_id": 12345 },
 *     { "fixture_id": 67890 }
 *   ],
 *   "premium_token": "..." // opcional, validação pode ser no front
 * }
 */

module.exports = async function handler(req, res) {
  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { fixtures } = req.body;

    // =========================================
    // VALIDAÇÃO 1: Fixtures enviados
    // =========================================
    if (!fixtures || !Array.isArray(fixtures)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'fixtures deve ser um array de objetos com fixture_id'
      });
    }

    // =========================================
    // VALIDAÇÃO 2: Máximo de 2 jogos
    // =========================================
    if (fixtures.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fixtures provided',
        message: 'Selecione pelo menos 1 jogo para análise'
      });
    }

    if (fixtures.length > 2) {
      return res.status(400).json({
        success: false,
        error: 'Too many fixtures',
        message: 'Máximo de 2 jogos por análise. Você enviou ' + fixtures.length
      });
    }

    // =========================================
    // VALIDAÇÃO 3: API Keys configuradas
    // =========================================
    const footballApiKey = process.env.API_FOOTBALL_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!footballApiKey) {
      console.error('❌ API_FOOTBALL_KEY não configurada');
      return res.status(500).json({
        success: false,
        error: 'Football API not configured'
      });
    }

    // =========================================
    // BUSCAR DADOS DOS JOGOS
    // =========================================
    console.log(`📡 Buscando dados de ${fixtures.length} jogos...`);
    
    const fixtureDataPromises = fixtures.map(f => 
      fetchFixtureData(f.fixture_id, footballApiKey)
    );
    
    const fixtureResults = await Promise.all(fixtureDataPromises);
    
    // Verificar se todos os jogos foram encontrados
    const errors = fixtureResults.filter(r => r.error);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch some fixtures',
        details: errors
      });
    }

    console.log(`✅ Dados obtidos para ${fixtureResults.length} jogos`);

    // =========================================
    // GERAR ANÁLISE COM IA
    // =========================================
    const analyses = {};
    
    for (let i = 0; i < fixtureResults.length; i++) {
      const fixtureData = fixtureResults[i];
      const gameKey = `game${i + 1}`;
      
      console.log(`🧠 Gerando análise para: ${fixtureData.teams.home.name} vs ${fixtureData.teams.away.name}`);
      
      const analysis = await generateAIAnalysis(fixtureData, openaiApiKey);
      analyses[gameKey] = {
        fixture_id: fixtures[i].fixture_id,
        match: `${fixtureData.teams.home.name} vs ${fixtureData.teams.away.name}`,
        league: fixtureData.league.name,
        date: fixtureData.fixture.date,
        analysis: analysis
      };
    }

    // =========================================
    // ANÁLISE COMBINADA (se 2 jogos)
    // =========================================
    let combinedAnalysis = null;
    
    if (fixtures.length === 2) {
      console.log('🎯 Gerando análise combinada...');
      combinedAnalysis = await generateCombinedAnalysis(
        analyses.game1,
        analyses.game2,
        fixtureResults,
        openaiApiKey
      );
    }

    // =========================================
    // RETORNAR ANÁLISES
    // =========================================
    return res.status(200).json({
      success: true,
      total_analyzed: fixtures.length,
      analysis: analyses,
      combined: combinedAnalysis,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Busca dados completos de uma fixture na API-Football
 */
async function fetchFixtureData(fixtureId, apiKey) {
  try {
    // Buscar dados básicos da fixture
    const fixtureResponse = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
      {
        headers: { 'x-apisports-key': apiKey }
      }
    );

    if (!fixtureResponse.ok) {
      throw new Error(`API returned ${fixtureResponse.status}`);
    }

    const fixtureData = await fixtureResponse.json();
    
    if (!fixtureData.response || fixtureData.response.length === 0) {
      return { error: true, fixture_id: fixtureId, message: 'Fixture not found' };
    }

    const fixture = fixtureData.response[0];
    const homeTeamId = fixture.teams.home.id;
    const awayTeamId = fixture.teams.away.id;
    const leagueId = fixture.league.id;

    // Buscar dados adicionais em paralelo
    const [h2hData, homeFormData, awayFormData, oddsData] = await Promise.all([
      // Head to Head
      fetchH2H(homeTeamId, awayTeamId, apiKey),
      // Forma recente do time da casa (últimos 5 jogos)
      fetchTeamForm(homeTeamId, leagueId, apiKey),
      // Forma recente do visitante (últimos 5 jogos)
      fetchTeamForm(awayTeamId, leagueId, apiKey),
      // Odds do jogo
      fetchOdds(fixtureId, apiKey)
    ]);

    return {
      fixture: fixture.fixture,
      league: fixture.league,
      teams: fixture.teams,
      goals: fixture.goals,
      score: fixture.score,
      h2h: h2hData,
      homeForm: homeFormData,
      awayForm: awayFormData,
      odds: oddsData
    };

  } catch (error) {
    console.error(`❌ Error fetching fixture ${fixtureId}:`, error.message);
    return { error: true, fixture_id: fixtureId, message: error.message };
  }
}

/**
 * Busca confrontos diretos (Head to Head)
 */
async function fetchH2H(homeId, awayId, apiKey) {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeId}-${awayId}&last=5`,
      { headers: { 'x-apisports-key': apiKey } }
    );
    const data = await response.json();
    return data.response || [];
  } catch {
    return [];
  }
}

/**
 * Busca forma recente do time
 */
async function fetchTeamForm(teamId, leagueId, apiKey) {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${teamId}&last=5`,
      { headers: { 'x-apisports-key': apiKey } }
    );
    const data = await response.json();
    return data.response || [];
  } catch {
    return [];
  }
}

/**
 * Busca odds do jogo
 */
async function fetchOdds(fixtureId, apiKey) {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/odds?fixture=${fixtureId}`,
      { headers: { 'x-apisports-key': apiKey } }
    );
    const data = await response.json();
    return data.response?.[0]?.bookmakers?.[0]?.bets || [];
  } catch {
    return [];
  }
}

/**
 * Gera análise com IA (OpenAI ou fallback)
 */
async function generateAIAnalysis(fixtureData, openaiApiKey) {
  // Preparar dados para o prompt
  const homeTeam = fixtureData.teams.home.name;
  const awayTeam = fixtureData.teams.away.name;
  const league = fixtureData.league.name;
  
  // Processar forma recente
  const homeFormResults = processFormResults(fixtureData.homeForm, fixtureData.teams.home.id);
  const awayFormResults = processFormResults(fixtureData.awayForm, fixtureData.teams.away.id);
  
  // Processar H2H
  const h2hSummary = processH2H(fixtureData.h2h, fixtureData.teams.home.id, fixtureData.teams.away.id);
  
  // Processar odds
  const oddsSummary = processOdds(fixtureData.odds);

  // Construir prompt
  const prompt = buildAnalysisPrompt({
    homeTeam,
    awayTeam,
    league,
    homeForm: homeFormResults,
    awayForm: awayFormResults,
    h2h: h2hSummary,
    odds: oddsSummary
  });

  // Se OpenAI disponível, usar
  if (openaiApiKey) {
    try {
      const aiResponse = await callOpenAI(prompt, openaiApiKey);
      return aiResponse;
    } catch (error) {
      console.warn('⚠️ OpenAI falhou, usando análise local:', error.message);
      return generateLocalAnalysis(fixtureData, homeFormResults, awayFormResults, h2hSummary, oddsSummary);
    }
  }

  // Fallback: análise local
  return generateLocalAnalysis(fixtureData, homeFormResults, awayFormResults, h2hSummary, oddsSummary);
}

/**
 * Processa resultados de forma
 */
function processFormResults(formData, teamId) {
  if (!formData || formData.length === 0) {
    return { results: [], wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
  }

  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  const results = [];

  formData.slice(0, 5).forEach(match => {
    const isHome = match.teams.home.id === teamId;
    const teamGoals = isHome ? match.goals.home : match.goals.away;
    const oppGoals = isHome ? match.goals.away : match.goals.home;

    goalsFor += teamGoals || 0;
    goalsAgainst += oppGoals || 0;

    if (teamGoals > oppGoals) {
      wins++;
      results.push('W');
    } else if (teamGoals < oppGoals) {
      losses++;
      results.push('L');
    } else {
      draws++;
      results.push('D');
    }
  });

  return { results, wins, draws, losses, goalsFor, goalsAgainst };
}

/**
 * Processa confrontos diretos
 */
function processH2H(h2hData, homeId, awayId) {
  if (!h2hData || h2hData.length === 0) {
    return { matches: 0, homeWins: 0, awayWins: 0, draws: 0 };
  }

  let homeWins = 0, awayWins = 0, draws = 0;

  h2hData.forEach(match => {
    const homeGoals = match.goals.home;
    const awayGoals = match.goals.away;
    const matchHomeId = match.teams.home.id;

    if (homeGoals === awayGoals) {
      draws++;
    } else if (homeGoals > awayGoals) {
      if (matchHomeId === homeId) homeWins++;
      else awayWins++;
    } else {
      if (matchHomeId === homeId) awayWins++;
      else homeWins++;
    }
  });

  return { matches: h2hData.length, homeWins, awayWins, draws };
}

/**
 * Processa odds
 */
function processOdds(oddsData) {
  if (!oddsData || oddsData.length === 0) {
    return null;
  }

  const matchWinner = oddsData.find(b => b.name === 'Match Winner');
  if (!matchWinner) return null;

  const values = matchWinner.values;
  return {
    home: values.find(v => v.value === 'Home')?.odd || '-',
    draw: values.find(v => v.value === 'Draw')?.odd || '-',
    away: values.find(v => v.value === 'Away')?.odd || '-'
  };
}

/**
 * Constrói prompt para a IA
 */
function buildAnalysisPrompt(data) {
  return `Analise este jogo de futebol usando os dados estatísticos reais abaixo.

📊 JOGO: ${data.homeTeam} vs ${data.awayTeam}
🏆 CAMPEONATO: ${data.league}

📈 FORMA RECENTE (últimos 5 jogos):
• ${data.homeTeam}: ${data.homeForm.results.join('-') || 'N/A'} (${data.homeForm.wins}V ${data.homeForm.draws}E ${data.homeForm.losses}D) - Gols: ${data.homeForm.goalsFor} marcados, ${data.homeForm.goalsAgainst} sofridos
• ${data.awayTeam}: ${data.awayForm.results.join('-') || 'N/A'} (${data.awayForm.wins}V ${data.awayForm.draws}E ${data.awayForm.losses}D) - Gols: ${data.awayForm.goalsFor} marcados, ${data.awayForm.goalsAgainst} sofridos

⚔️ CONFRONTOS DIRETOS (últimos ${data.h2h.matches} jogos):
• ${data.homeTeam}: ${data.h2h.homeWins} vitórias
• ${data.awayTeam}: ${data.h2h.awayWins} vitórias
• Empates: ${data.h2h.draws}

${data.odds ? `💰 ODDS:
• ${data.homeTeam}: ${data.odds.home}
• Empate: ${data.odds.draw}
• ${data.awayTeam}: ${data.odds.away}` : ''}

🎯 INSTRUÇÕES:
1. Faça uma análise objetiva baseada APENAS nos dados acima
2. Indique o cenário MAIS PROVÁVEL (vitória casa, empate, vitória fora)
3. Sugira o MERCADO MAIS SEGURO (1X2, Over/Under, BTTS, etc)
4. Explique de forma SIMPLES e DIRETA o motivo
5. Dê uma nota de CONFIANÇA de 1 a 10

Responda em português brasileiro, de forma clara e objetiva.`;
}

/**
 * Chama OpenAI API
 */
async function callOpenAI(prompt, apiKey) {
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
          content: 'Você é um analista profissional de futebol. Analise jogos de forma objetiva, clara e direta. Foque em dados estatísticos e probabilidades. Seja conciso mas completo.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI error: ${response.status} - ${errorData.error?.message || 'Unknown'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Gera análise local (fallback sem OpenAI)
 */
function generateLocalAnalysis(fixtureData, homeForm, awayForm, h2h, odds) {
  const homeTeam = fixtureData.teams.home.name;
  const awayTeam = fixtureData.teams.away.name;
  
  // Calcular pontuação de forma
  const homeFormScore = (homeForm.wins * 3) + homeForm.draws;
  const awayFormScore = (awayForm.wins * 3) + awayForm.draws;
  
  // Determinar favorito
  let prediction, confidence, reasoning;
  
  if (homeFormScore > awayFormScore + 3) {
    prediction = `Vitória do ${homeTeam}`;
    confidence = 7;
    reasoning = `${homeTeam} está em melhor forma recente com ${homeForm.wins} vitórias nos últimos 5 jogos, além de jogar em casa.`;
  } else if (awayFormScore > homeFormScore + 3) {
    prediction = `Vitória do ${awayTeam}`;
    confidence = 6;
    reasoning = `${awayTeam} demonstra melhor momento com ${awayForm.wins} vitórias recentes, apesar de jogar fora.`;
  } else {
    prediction = 'Empate ou jogo equilibrado';
    confidence = 5;
    reasoning = `Ambas equipes estão com desempenho similar. ${homeTeam} tem a vantagem do mando de campo.`;
  }
  
  // Analisar gols
  const totalGoalsHome = homeForm.goalsFor + homeForm.goalsAgainst;
  const totalGoalsAway = awayForm.goalsFor + awayForm.goalsAgainst;
  const avgGoals = (totalGoalsHome + totalGoalsAway) / 10;
  
  const goalsMarket = avgGoals > 2.5 
    ? 'Over 2.5 gols - Média de gols alta nos jogos recentes'
    : 'Under 2.5 gols - Jogos com poucos gols recentemente';

  return `📊 **ANÁLISE DO JOGO**

🏠 **${homeTeam}** vs **${awayTeam}** 🛫

📈 **Forma Recente:**
• ${homeTeam}: ${homeForm.results.join('-') || 'N/A'} (${homeForm.wins}V-${homeForm.draws}E-${homeForm.losses}D)
• ${awayTeam}: ${awayForm.results.join('-') || 'N/A'} (${awayForm.wins}V-${awayForm.draws}E-${awayForm.losses}D)

⚔️ **Confrontos Diretos:** ${h2h.matches} jogos (${h2h.homeWins}x${h2h.draws}x${h2h.awayWins})

🎯 **Previsão Principal:** ${prediction}
📊 **Confiança:** ${confidence}/10

💡 **Análise:** ${reasoning}

🎲 **Mercado Sugerido:** ${goalsMarket}

${odds ? `💰 **Odds:** Casa ${odds.home} | Empate ${odds.draw} | Fora ${odds.away}` : ''}

⚠️ *Análise baseada em estatísticas. Aposte com responsabilidade.*`;
}

/**
 * Gera análise combinada de 2 jogos com estratégias
 */
async function generateCombinedAnalysis(game1, game2, fixtureResults, openaiApiKey) {
  const data1 = fixtureResults[0];
  const data2 = fixtureResults[1];
  
  // Processar odds
  const odds1 = processOdds(data1.odds);
  const odds2 = processOdds(data2.odds);
  
  // Se tem OpenAI, usar IA para análise combinada
  if (openaiApiKey) {
    try {
      const combinedPrompt = buildCombinedPrompt(game1, game2, data1, data2);
      const aiResponse = await callOpenAICombined(combinedPrompt, openaiApiKey);
      return parseAICombinedResponse(aiResponse, game1, game2, odds1, odds2);
    } catch (error) {
      console.warn('⚠️ OpenAI falhou para análise combinada:', error.message);
    }
  }
  
  // Fallback: análise local combinada
  return generateLocalCombinedAnalysis(game1, game2, data1, data2, odds1, odds2);
}

/**
 * Prompt para análise combinada
 */
function buildCombinedPrompt(game1, game2, data1, data2) {
  return `Você é um analista de apostas profissional. Analise estes 2 jogos e sugira combinações de apostas.

🎮 JOGO 1: ${game1.match}
Liga: ${game1.league}
Análise: ${game1.analysis.substring(0, 500)}...

🎮 JOGO 2: ${game2.match}
Liga: ${game2.league}
Análise: ${game2.analysis.substring(0, 500)}...

📊 CRIE 3 ESTRATÉGIAS DE APOSTA:

1️⃣ CONSERVADORA (70-80% de chance):
- Foque em mercados de menor risco
- Odds combinadas entre 1.50 e 2.00
- Ex: Over 0.5 gols + Resultado duplo

2️⃣ MODERADA (50-65% de chance):
- Equilíbrio entre risco e retorno
- Odds combinadas entre 2.00 e 4.00
- Ex: Vitória favorito + BTTS

3️⃣ AGRESSIVA (30-45% de chance):
- Alto risco, alto retorno
- Odds combinadas acima de 5.00
- Ex: Placar exato + Ambos marcam

Para cada estratégia forneça:
- Aposta sugerida para cada jogo
- Justificativa estatística
- Odds aproximadas
- Probabilidade estimada

Responda em JSON com esta estrutura:
{
  "conservative": { "bets": [...], "odds": "X.XX", "probability": "XX%", "reasoning": "..." },
  "moderate": { "bets": [...], "odds": "X.XX", "probability": "XX%", "reasoning": "..." },
  "aggressive": { "bets": [...], "odds": "X.XX", "probability": "XX%", "reasoning": "..." },
  "bestPick": { "type": "...", "description": "..." }
}`;
}

/**
 * Chama OpenAI para análise combinada
 */
async function callOpenAICombined(prompt, apiKey) {
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
          content: 'Você é um analista de apostas esportivas. Responda APENAS em JSON válido, sem markdown.'
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
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Parseia resposta da IA para análise combinada
 */
function parseAICombinedResponse(aiResponse, game1, game2, odds1, odds2) {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        games: [
          { match: game1.match, league: game1.league },
          { match: game2.match, league: game2.league }
        ],
        strategies: {
          conservative: parsed.conservative,
          moderate: parsed.moderate,
          aggressive: parsed.aggressive
        },
        bestPick: parsed.bestPick,
        source: 'ai'
      };
    }
  } catch (e) {
    console.warn('Falha ao parsear JSON da IA:', e.message);
  }
  
  // Retornar fallback local se parsing falhar
  return generateLocalCombinedAnalysis(game1, game2, null, null, odds1, odds2);
}

/**
 * Gera análise combinada local (fallback)
 */
function generateLocalCombinedAnalysis(game1, game2, data1, data2, odds1, odds2) {
  // Estratégias baseadas em lógica simples
  return {
    games: [
      { match: game1.match, league: game1.league },
      { match: game2.match, league: game2.league }
    ],
    strategies: {
      conservative: {
        name: "Conservadora",
        icon: "🛡️",
        description: "Baixo risco, retorno menor",
        probability: "70-80%",
        bets: [
          {
            game: game1.match,
            market: "Over 0.5 Gols",
            reasoning: "Mercado de alta probabilidade"
          },
          {
            game: game2.match,
            market: "Dupla Chance (1X ou X2)",
            reasoning: "Proteção contra empate"
          }
        ],
        combinedOdds: "1.60 - 1.90",
        potentialReturn: "60% - 90%"
      },
      moderate: {
        name: "Moderada",
        icon: "⚖️",
        description: "Equilíbrio risco/retorno",
        probability: "50-65%",
        bets: [
          {
            game: game1.match,
            market: odds1 ? (parseFloat(odds1.home) < parseFloat(odds1.away) ? "Vitória Casa" : "Vitória Fora") : "Favorito",
            reasoning: "Apostar no time com melhor odd"
          },
          {
            game: game2.match,
            market: "Over 1.5 Gols",
            reasoning: "Mercado equilibrado"
          }
        ],
        combinedOdds: "2.50 - 3.50",
        potentialReturn: "150% - 250%"
      },
      aggressive: {
        name: "Agressiva",
        icon: "🔥",
        description: "Alto risco, alto retorno",
        probability: "30-45%",
        bets: [
          {
            game: game1.match,
            market: "Ambos Marcam (BTTS)",
            reasoning: "Mercado de maior risco"
          },
          {
            game: game2.match,
            market: "Over 2.5 Gols",
            reasoning: "Expectativa de jogo movimentado"
          }
        ],
        combinedOdds: "4.00 - 7.00",
        potentialReturn: "300% - 600%"
      }
    },
    bestPick: {
      type: "moderate",
      title: "Recomendação do Dia",
      description: "A estratégia moderada oferece o melhor equilíbrio entre risco e retorno para esta combinação de jogos."
    },
    tips: [
      "💡 Nunca aposte mais do que pode perder",
      "📊 Use gestão de banca (máx 5% por aposta)",
      "🎯 Foque em mercados que você entende"
    ],
    source: 'local'
  };
}
