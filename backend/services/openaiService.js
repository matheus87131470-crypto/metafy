import OpenAI from "openai";

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY || 'sk-dummy';
    client = new OpenAI({ apiKey });
  }
  return client;
}

/** Gera summary padronizado sem chamar a IA (fallback local) */
function buildLocalAnalysis(data) {
  const edge         = typeof data.edge === 'number' ? data.edge : (parseFloat(data.edge) || 0);
  const bestPickLabel = data.bestPickLabel || data.market || 'Melhor opção';
  const confidence   =
    edge >= 4   ? 'Forte'
    : edge >= 2 ? 'Moderada'
    : edge >= 0 ? 'Leve'
    : 'Alto risco';

  const summaryMap = {
    Forte:       `A melhor relação risco/retorno hoje está em ${bestPickLabel}, com edge de ${edge.toFixed(2)}%.`,
    Moderada:    `A melhor relação risco/retorno hoje está em ${bestPickLabel}, com edge de ${edge.toFixed(2)}%.`,
    Leve:        `A direção mais consistente é ${bestPickLabel}, mas com edge baixo; stake conservadora.`,
    'Alto risco':`Mercado sem valor estatístico; se entrar, faça stake mínima. Melhor opção ainda é ${bestPickLabel}.`,
  };

  return {
    bestPick:      data.bestPick      || 'home',
    bestPickLabel,
    confidence,
    edge,
    probAdjusted:  typeof data.probAdjusted  === 'number' ? data.probAdjusted  : (parseFloat(data.probAdjusted)  || 0),
    probImplied:   typeof data.probImplied   === 'number' ? data.probImplied   : (parseFloat(data.probImplied)   || 0),
    summary:       summaryMap[confidence],
    bullets: [
      data.homeLast5   ? `Forma ${data.home ?? 'Casa'}: ${Array.isArray(data.homeLast5) ? data.homeLast5.join('-') : data.homeLast5}` : `Jogo: ${data.home ?? '?'} x ${data.away ?? '?'}`,
      data.awayLast5   ? `Forma ${data.away ?? 'Fora'}: ${Array.isArray(data.awayLast5) ? data.awayLast5.join('-') : data.awayLast5}` : `Competição: ${data.competition ?? '?'}`,
      `Edge calculado: ${edge.toFixed(2)}% | Prob ajustada: ${(data.probAdjusted ?? 0).toFixed(1)}% vs implícita: ${(data.probImplied ?? 0).toFixed(1)}%`,
    ],
  };
}

export async function analyzeWithAI(data) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-dummy') {
    return buildLocalAnalysis(data);
  }

  const edge = typeof data.edge === 'number' ? data.edge : (parseFloat(data.edge) || 0);

  const prompt = `
Você é um analista profissional de apostas esportivas. Retorne SOMENTE um JSON válido, sem markdown, sem texto extra.

Dados do jogo:
Jogo: ${data.home} x ${data.away}
Competição: ${data.competition ?? '?'}
Odds: Casa ${data.homeOdds ?? data.odd ?? '?'} | Empate ${data.drawOdds ?? '?'} | Fora ${data.awayOdds ?? '?'}
Mercado de maior edge: ${data.bestPickLabel ?? data.market ?? '?'}
Edge estimado: ${edge}%
Prob ajustada: ${data.probAdjusted ?? '?'}% | Prob implícita: ${data.probImplied ?? '?'}%
Forma (Casa): ${data.homeLast5 ?? '?'}
Forma (Fora): ${data.awayLast5 ?? '?'}
Média de gols (Casa): ${data.homeGoalsAvg ?? '?'} | Média (Fora): ${data.awayGoalsAvg ?? '?'}

Regras obrigatórias:
1. Escolha o mercado com MAIOR edge entre Casa, Empate, Fora. Se edges muito próximos, prefira Casa (mando).
2. Nunca seja neutro. Sempre dê direção clara.
3. Nunca use: "Jogo equilibrado", "Pode surpreender", "Tudo pode acontecer", "Sem valor claro".
4. Classifique: edge≥4% → Forte | 2-4% → Moderada | 0-2% → Leve | negativo → Alto risco

Retorne EXATAMENTE este JSON (sem nenhum outro texto):
{
  "bestPick": "home|draw|away",
  "bestPickLabel": "Vitória Casa|Empate|Vitória Fora",
  "confidence": "Forte|Moderada|Leve|Alto risco",
  "edge": 0,
  "probAdjusted": 0,
  "probImplied": 0,
  "summary": "frase direta com direção clara",
  "bullets": ["bullet 1 com dado objetivo","bullet 2 com dado objetivo","bullet 3 com dado objetivo"]
}
`;

  try {
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    // Garantir campos obrigatórios nunca ausentes
    return {
      bestPick:      parsed.bestPick      || data.bestPick  || 'home',
      bestPickLabel: parsed.bestPickLabel || data.bestPickLabel || 'Vitória Casa',
      confidence:    ['Forte','Moderada','Leve','Alto risco'].includes(parsed.confidence)
                       ? parsed.confidence : 'Leve',
      edge:          typeof parsed.edge === 'number' ? parsed.edge : edge,
      probAdjusted:  parsed.probAdjusted  ?? data.probAdjusted  ?? 0,
      probImplied:   parsed.probImplied   ?? data.probImplied   ?? 0,
      summary:       parsed.summary       || buildLocalAnalysis(data).summary,
      bullets:       Array.isArray(parsed.bullets) && parsed.bullets.length >= 3
                       ? parsed.bullets.slice(0, 3)
                       : buildLocalAnalysis(data).bullets,
    };
  } catch (err) {
    console.warn('⚠️ OpenAI falhou, usando análise local:', err.message);
    return buildLocalAnalysis(data);
  }
}
