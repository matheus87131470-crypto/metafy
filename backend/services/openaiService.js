import OpenAI from "openai";

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY || 'sk-dummy';
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function analyzeWithAI(data) {
  const prompt = `
Você é um analista profissional de apostas esportivas focado em identificar valor matemático real.

Receberá:
- Times (casa vs visitante)
- Odds (home, draw, away)
- Probabilidade implícita
- Probabilidade ajustada
- Edge calculado
- Forma recente (últimos 5)
- Média de gols

Dados do jogo:
Jogo: ${data.home} x ${data.away}
Competição: ${data.competition}
Odds: Casa ${data.homeOdds ?? data.odd} | Empate ${data.drawOdds ?? '—'} | Fora ${data.awayOdds ?? '—'}
Mercado analisado: ${data.market}
Edge estimado: ${data.edge ?? '—'}%
Forma (Casa): ${data.homeLast5 ?? '—'}
Forma (Fora): ${data.awayLast5 ?? '—'}
Média de gols (Casa): ${data.homeGoalsAvg ?? '—'} | Média de gols (Fora): ${data.awayGoalsAvg ?? '—'}

Regras obrigatórias:
1. Escolha apenas o mercado com MAIOR edge real.
2. Se o edge for inferior a 2%, classifique como "Sem valor claro".
3. Nunca escolha automaticamente "Empate" se houver outro mercado com edge maior.
4. Explique de forma objetiva:
   - Por que existe valor
   - O risco envolvido
   - Se é aposta agressiva ou conservadora
5. Nunca use frases genéricas como "Jogo equilibrado", "Pode surpreender" ou "Tudo pode acontecer".

Formato obrigatório da resposta:

🔎 Análise Técnica:
(2-3 parágrafos objetivos)

📊 Valor Identificado:
Mercado: X
Odd: X
Edge: X%

⚠️ Nível de Risco:
Baixo / Médio / Alto

Conclusão direta e profissional.
`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return response.choices[0].message.content;
}
