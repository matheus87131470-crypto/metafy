# 📦 Reorganização Completa - Metafy v2.2

## 🎯 Resumo da Reorganização

Este documento descreve a reorganização completa do projeto Metafy para suportar:
- Filtros por País → Liga → Campeonato
- Jogos organizados por liga
- Área Premium com análise combinada de 2 jogos
- Estratégias de apostas (Conservadora, Moderada, Agressiva)

---

## 📁 Estrutura de Arquivos

```
/api
  ├── fixtures.js          # 🆕 Jogos organizados por liga
  ├── leagues.js           # 🆕 Lista de ligas com filtros
  ├── games.js             # Jogos (legado)
  ├── analyze.js           # Análise individual
  ├── /ai
  │   └── analyze-fixtures.js  # 🔄 Análise combinada Premium
  └── /football
      ├── fixtures.js      # Próximas partidas
      ├── live.js          # Jogos ao vivo
      └── today.js         # Jogos de hoje

/src
  ├── app.js               # 🔄 Orquestrador principal
  ├── /config
  │   └── leagues.js       # 🆕 Configuração de ligas prioritárias
  ├── /services
  │   ├── apiFootball.js   # 🆕 Serviço completo API-Football
  │   ├── aiAnalysisService.js
  │   └── gamesService.js
  ├── /styles
  │   ├── theme.css
  │   ├── cards.css
  │   ├── premium.css
  │   ├── filters.css      # 🆕 Estilos para filtros
  │   └── premium-analysis.css  # 🆕 Estilos análise combinada
  └── /ui
      ├── LeagueFilter.js   # 🆕 Componente de filtros
      ├── LeagueGames.js    # 🆕 Jogos organizados por liga
      ├── PremiumAnalysis.js # 🆕 Área Premium
      ├── GameCard.js
      ├── AnalysisModal.js
      ├── Loader.js
      └── PremiumBadge.js
```

---

## 🔧 APIs Criadas

### GET `/api/fixtures`
Busca jogos organizados por liga.

**Query Params:**
- `league`: ID da liga (opcional)
- `date`: Data (YYYY-MM-DD)
- `live`: Se "true", jogos ao vivo
- `next`: Quantidade de próximos jogos
- `country`: Filtrar por país

**Resposta:**
```json
{
  "success": true,
  "total": 15,
  "fixtures": [
    {
      "id": 71,
      "name": "Brasileirão Série A",
      "country": "Brazil",
      "flag": "🇧🇷",
      "fixtures": [...]
    }
  ]
}
```

### GET `/api/leagues`
Lista ligas disponíveis.

**Query Params:**
- `country`: Filtrar por país
- `priority`: Se "true", apenas ligas prioritárias
- `search`: Buscar por nome

**Resposta:**
```json
{
  "success": true,
  "countries": [...],
  "leagues": [...],
  "byCountry": {...}
}
```

### POST `/api/ai/analyze-fixtures`
Análise Premium de até 2 jogos.

**Body:**
```json
{
  "fixtures": [
    { "fixture_id": 12345 },
    { "fixture_id": 67890 }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "analysis": {
    "game1": { "match": "...", "analysis": "..." },
    "game2": { "match": "...", "analysis": "..." }
  },
  "combined": {
    "strategies": {
      "conservative": { "bets": [...], "probability": "70-80%" },
      "moderate": { "bets": [...], "probability": "50-65%" },
      "aggressive": { "bets": [...], "probability": "30-45%" }
    },
    "bestPick": { "type": "moderate", "description": "..." }
  }
}
```

---

## 🏆 Ligas Prioritárias

| ID | Liga | País | Prioridade |
|----|------|------|------------|
| 71 | Brasileirão Série A | Brasil 🇧🇷 | 1 |
| 72 | Brasileirão Série B | Brasil 🇧🇷 | 2 |
| 73 | Copa do Brasil | Brasil 🇧🇷 | 3 |
| 39 | Premier League | Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | 4 |
| 140 | La Liga | Espanha 🇪🇸 | 5 |
| 78 | Bundesliga | Alemanha 🇩🇪 | 6 |
| 135 | Serie A | Itália 🇮🇹 | 7 |
| 61 | Ligue 1 | França 🇫🇷 | 8 |
| 2 | Champions League | Europa 🇪🇺 | 9 |
| 3 | Europa League | Europa 🇪🇺 | 10 |
| 13 | Libertadores | América do Sul 🌎 | 11 |

---

## 🎨 Componentes UI

### LeagueFilter.js
- Pills de seleção de país
- Dropdown de ligas
- Barra de busca
- Filtros rápidos (Ao Vivo, Próximos, Finalizados)

### LeagueGames.js
- Agrupa jogos por liga
- Cards compactos de jogos
- Seção de jogos ao vivo em destaque

### PremiumAnalysis.js
- Seleção de até 2 jogos
- Botão flutuante de análise
- Modal de análise combinada
- Cards de estratégias (Conservadora/Moderada/Agressiva)

---

## 💎 Sistema Premium

- **Preço:** R$ 4,50 por 7 dias
- **Sem renovação automática**
- **Análises ilimitadas durante o período**
- **Análise combinada de 2 jogos**
- **Estratégias de apostas personalizadas**

---

## 🚀 Deploy

O projeto está configurado para Vercel:

1. Todas as APIs usam CommonJS (`module.exports`)
2. Environment variables necessárias:
   - `API_FOOTBALL_KEY`: Chave da API-Football
   - `OPENAI_API_KEY`: Chave da OpenAI (opcional)

```bash
# Deploy
vercel --prod
```

---

## 📝 Changelog

### v2.2.0
- ✅ Criado `/api/fixtures` com jogos por liga
- ✅ Criado `/api/leagues` para listar ligas
- ✅ Criado `src/services/apiFootball.js`
- ✅ Criado `src/config/leagues.js`
- ✅ Criado `src/ui/LeagueFilter.js`
- ✅ Criado `src/ui/LeagueGames.js`
- ✅ Criado `src/ui/PremiumAnalysis.js`
- ✅ Criado `src/styles/filters.css`
- ✅ Criado `src/styles/premium-analysis.css`
- ✅ Atualizado `/api/ai/analyze-fixtures.js` com estratégias
- ✅ Atualizado `src/app.js` com filtros e organização
- ✅ Atualizado `index.html` com novos estilos e scripts
- ✅ Convertido todas APIs para CommonJS
