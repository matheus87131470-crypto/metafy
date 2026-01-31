# 🚀 Football AI - Backend API

Backend REST para a plataforma Football AI. Análise de jogos de futebol com integração RapidAPI.

## 📋 Features

- ✅ **GET /health** - Health check da API
- ✅ **GET /games/today** - Lista jogos do dia (RapidAPI)
- ✅ **POST /analyze-game** - Análise heurística de jogos
- ✅ **Fallback automático** - Jogos mockados se API falhar
- ✅ **Análise estatística** - Sem IA pesada, heurística eficiente
- ✅ **Variáveis de ambiente** - Segurança de chaves

## 🔧 Instalação Local

### Pré-requisitos
- Node.js 18.x
- npm ou yarn
- Chave RapidAPI

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/matheus87131470-crypto/metafy.git
cd metafy

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e adicione sua RAPIDAPI_KEY

# 4. Execute em desenvolvimento
npm run dev

# 5. Teste a API
curl http://localhost:3001/health
```

## 📡 Endpoints

### GET /health
Status da API.

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "success": true,
  "status": "OK",
  "message": "Football AI Backend is running",
  "timestamp": "2026-01-31T10:00:00Z",
  "version": "1.0.0"
}
```

### GET /games/today
Lista jogos do dia com odds.

```bash
curl http://localhost:3001/games/today
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "date": "2026-01-31",
  "games": [
    {
      "id": 1,
      "homeTeam": "Flamengo",
      "awayTeam": "Palmeiras",
      "competition": "Campeonato Brasileiro",
      "homeOdds": 2.40,
      "drawOdds": 3.20,
      "awayOdds": 2.85
    }
  ]
}
```

### POST /analyze-game
Análise de um jogo específico.

```bash
curl -X POST http://localhost:3001/analyze-game \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeam": "Flamengo",
    "awayTeam": "Palmeiras",
    "competition": "Campeonato Brasileiro",
    "homeOdds": 2.40,
    "drawOdds": 3.20,
    "awayOdds": 2.85
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "homeTeam": "Flamengo",
    "awayTeam": "Palmeiras",
    "probabilities": {
      "home": 52,
      "draw": 30,
      "away": 18
    },
    "recommendation": "Vitória Flamengo",
    "riskLevel": "MÉDIO",
    "confidence": 68,
    "overUnder": "Over 2.5",
    "value_bets": [...]
  }
}
```

## 🌐 Deploy no Render

### 1. Preparação

O projeto já está pronto para Render:
- ✅ `package.json` com `start` script
- ✅ `server.js` usando `process.env.PORT`
- ✅ `.env.example` com variáveis necessárias

### 2. Deploy Steps

1. **Acesse** https://render.com/
2. **Nova Web Service** → Connect GitHub
3. **Selecione** `metafy` repository
4. **Configuração:**
   - **Name:** `football-ai-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (ou Starter)

5. **Environment Variables** (adicione):
   ```
   PORT=3001
   NODE_ENV=production
   RAPIDAPI_KEY=your_key_here
   RAPIDAPI_HOST=api-football-v3.p.rapidapi.com
   ```

6. **Deploy** → Aguarde build completar

### 3. URL de Produção

Após deploy, a API estará em:
```
https://football-ai-backend.onrender.com/health
https://football-ai-backend.onrender.com/games/today
```

## 📱 Consumir do Frontend

No `app.js`, configure o endpoint da API:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://football-ai-backend.onrender.com'
  : 'http://localhost:3001';

// Buscar jogos
async function loadGamesList() {
    const response = await fetch(`${API_BASE_URL}/games/today`);
    const data = await response.json();
    if (data.success) {
        renderGamesList(data.games);
    }
}

// Analisar jogo
async function analyzeGame(homeTeam, awayTeam, competition, odds) {
    const response = await fetch(`${API_BASE_URL}/analyze-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            homeTeam,
            awayTeam,
            competition,
            homeOdds: odds.home,
            drawOdds: odds.draw,
            awayOdds: odds.away
        })
    });
    return response.json();
}
```

## 🔐 Segurança

- ✅ Chaves nunca no código (somente `.env`)
- ✅ `.env` no `.gitignore`
- ✅ `.env.example` versionado
- ✅ CORS habilitado (ajuste se necessário)
- ✅ Validação de input nos endpoints

## 📊 Algoritmo de Análise

A análise é heurística e estatística:

1. **Cálculo de Score** dos times baseado em hash do nome
2. **Probabilidades** calculadas matematicamente
3. **Implied Probability** das odds
4. **Value Betting** - Calcula EV (Expected Value)
5. **Recomendação** baseada no melhor value
6. **Risco** determinado pela odd

**Sem IA pesada** - Rápido e eficiente em RAM!

## 🚨 Troubleshooting

### "RAPIDAPI_KEY não configurada"
Certifique-se de que `.env` tem a chave correta:
```bash
RAPIDAPI_KEY=sk_live_... (sua chave real)
```

### "Connection refused"
Verifique se o servidor está rodando:
```bash
npm run dev
# Deve aparecer:
# 🚀 Football AI Backend API Started
# Port: 3001
```

### API retorna jogos mockados
Significa que RapidAPI não respondeu. Verifique:
1. Chave RapidAPI válida
2. Cota de requisições não esgotada
3. Conexão de internet

## 📦 Scripts

```bash
npm start      # Iniciar em produção
npm run dev    # Iniciar em desenvolvimento (com nodemon)
npm run serve  # Servidor HTTP estático (frontend)
```

## 🎯 Roadmap

- [ ] Autenticação de usuários
- [ ] Banco de dados (MongoDB/PostgreSQL)
- [ ] Cache de resultados
- [ ] Predictor com ML
- [ ] WebSocket para updates em tempo real
- [ ] Rate limiting

## 📝 Licença

MIT

## 👨‍💻 Autor

Matheus Crypto - [@matheus87131470-crypto](https://github.com/matheus87131470-crypto)

---

**Pronto para deploy!** 🚀

1. Configure RAPIDAPI_KEY no Render
2. Faça deploy
3. Frontend em Vercel consome a API em produção
