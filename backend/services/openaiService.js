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
1. Compare os três mercados (Casa, Empate, Fora) e escolha o de MAIOR edge.
2. Nunca seja neutro. Sempre dê uma direção clara.
3. Nunca use frases genéricas como "Jogo equilibrado", "Pode surpreender" ou "Tudo pode acontecer".
4. Classifique a força da aposta pelo edge:
   - Edge acima de 4% → Forte
   - Edge entre 2% e 4% → Moderada
   - Edge entre 0% e 2% → Leve
   - Edge negativo → Alto risco

Formato obrigatório da resposta:

⭐ Melhor Opção:
Vitória Casa / Empate / Vitória Fora

📊 Confiança:
Forte / Moderada / Leve / Alto Risco

📈 Justificativa:
Explique matematicamente com base em probabilidade ajustada vs implícita.

Conclusão direta e profissional.
`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return response.choices[0].message.content;
}
