import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeWithAI(data) {
  const prompt = `
Você é um analista profissional de apostas esportivas.

Jogo: ${data.home} x ${data.away}
Competição: ${data.competition}
Mercado: ${data.market}
Odd: ${data.odd}
Stake: ${data.stake}

Gere:
- nível de risco (Baixo, Médio ou Alto)
- probabilidade estimada (%)
- análise técnica objetiva
- recomendação final
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4
  });

  return response.choices[0].message.content;
}
