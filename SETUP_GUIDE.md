# Football AI - Plataforma de Análise de Futebol com IA

## 🎯 Sobre

Plataforma profissional de análise de futebol que integra:
- ⚽ **Jogos Reais**: Dados em tempo real via API-Football
- 🤖 **IA Real**: Análises com OpenAI GPT
- 📊 **Ganhos/Perdas**: Tracking interativo com animações

## 🚀 Setup Local

### 1. Clonar repositório
```bash
git clone https://github.com/matheus87131470-crypto/metafy.git
cd metafy
```

### 2. Instalar dependências (opcional)
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:

#### Obter RAPIDAPI_KEY (Jogos Reais)
1. Acesse: https://rapidapi.com/api-sports/api/api-football-v3
2. Faça signup/login
3. Copie sua API Key
4. Cole em `RAPIDAPI_KEY`

#### Obter OPENAI_API_KEY (IA)
1. Acesse: https://platform.openai.com/api-keys
2. Faça signup/login
3. Create new secret key
4. Cole em `OPENAI_API_KEY`

### 4. Rodar localmente

```bash
# Usando Node.js
npm start

# Ou com Python
python -m http.server 8000

# Ou com http-server
npx http-server -p 8000
```

Acesse: http://localhost:8000

## 📁 Estrutura de Arquivos

```
/
├── index.html                  # Página principal
├── styles.css                  # Estilos (glassmorphism)
├── app.js                       # Script principal (client-side)
├── balance.js                   # Gerenciador de ganhos/perdas
│
├── api/                         # Serverless Functions (Vercel)
│   ├── analyze.js              # Endpoint de IA
│   └── games.js                # Endpoint de jogos
│
├── services/                    # Serviços compartilhados
│   ├── games-service.js        # Integração com API-Football
│   └── ai-prompts.js           # Prompts da IA
│
└── .env.example                # Template de variáveis
```

## 🔌 Funcionalidades

### 1. Jogos Reais
- Busca jogos do dia via API-Football
- Exibe times, competição, horário
- Fallback automático se API falhar

### 2. Análise com IA
- Integra OpenAI GPT-3.5
- Análise contextual do confronto
- Cálculo de risco
- Recomendações personalizadas

### 3. Ganhos/Perdas
- Registro de apostas ganhas
- Registro de apostas perdidas
- Barra visual com animação
- Histórico com timestamps
- LocalStorage para persistência

## 🛠️ Endpoints API

### GET `/api/games`
Retorna jogos do dia
```json
{
  "success": true,
  "count": 6,
  "games": [...]
}
```

### POST `/api/analyze`
Analisa um jogo com IA
```json
{
  "homeTeam": "Flamengo",
  "awayTeam": "Palmeiras",
  "competition": "Campeonato Brasileiro",
  "market": "vencedor",
  "odd": 2.50,
  "amount": 100
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "contexto": "...",
    "forma": {...},
    "risco": "MEDIUM",
    "observacoes": [...],
    "recomendacao": "..."
  }
}
```

## 📱 Responsividade

- ✅ Mobile (480px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)

## 🎨 Design

- Glassmorphism com blur 10px
- Dark theme #0a0e27
- Cores: Indigo, Pink, Teal
- Animações suaves (cubic-bezier)

## 📊 Mercados Suportados

1. Vencedor (1x2)
2. Ambas Marcam
3. Over 2.5 Gols
4. Under 2.5 Gols
5. Resultado Exato
6. Handicap
7. Primeiro Gol
8. Cartões
9. Escanteios

## 🚀 Deploy no Vercel

1. Push para GitHub
2. Conecte em https://vercel.com
3. Adicione variáveis de ambiente no Vercel
4. Deploy automático

```bash
git add .
git commit -m "add jogos reais, ia real e barra ganho/perda"
git push
```

## 🔐 Segurança

- ⚠️ **NUNCA** commite `.env` com chaves reais
- Use `.env.local` para desenvolvimento
- Adicione variáveis via dashboard do Vercel

## 📝 Notas

- API-Football tem limite de requisições
- OpenAI cobra por tokens de IA
- Cache de 5 minutos em jogos
- Fallback automático se APIs falhem

## 📄 Licença

MIT

## 👨‍💻 Autor

Matheus Crypto

## 🐛 Problemas?

- Verifique `.env.local`
- Veja console do navegador (F12)
- Veja logs do servidor

---

**Made with ⚽ and 🤖**
