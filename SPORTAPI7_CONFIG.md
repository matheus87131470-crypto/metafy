# Configuração SportAPI7 - Render

## Variáveis de Ambiente Necessárias

Configure no painel do Render (Environment):

```
RAPIDAPI_KEY=sua_chave_rapidapi_aqui
RAPIDAPI_HOST=sportapi7.p.rapidapi.com
```

## Como Obter as Credenciais

1. Acesse https://rapidapi.com/sportapi/api/sportapi7
2. Faça login/cadastro na RapidAPI
3. Assine um plano (Free, Basic, etc)
4. No painel "Endpoints", procure por:
   - **X-RapidAPI-Key**: Copie sua chave
   - **X-RapidAPI-Host**: `sportapi7.p.rapidapi.com`

## Endpoints Implementados

### Backend (Express)

✅ **GET /api/matches/today**
- Retorna partidas agendadas para hoje
- Cache: 60 segundos
- Endpoint SportAPI7: `/api/v1/sport/football/scheduled-events/{date}`

✅ **GET /api/matches/live**
- Retorna partidas ao vivo
- Cache: 60 segundos
- Endpoint SportAPI7: `/api/v1/sport/football/live-events`

✅ **GET /api/match/:id**
- Retorna detalhes de uma partida
- Endpoint SportAPI7: `/api/v1/sport/football/event/{id}/details`

✅ **POST /api/insights-ai**
- Gera insights com OpenAI (requer OPENAI_API_KEY)

## Estrutura de Resposta

### GET /api/matches/today
```json
{
  "success": true,
  "count": 50,
  "matches": [
    {
      "id": 12345,
      "league": "Premier League",
      "country": "England",
      "kickoff": "2026-02-16T15:00:00.000Z",
      "home": "Manchester United",
      "away": "Liverpool",
      "status": "notstarted",
      "homeScore": null,
      "awayScore": null
    }
  ]
}
```

### GET /api/matches/live
```json
{
  "success": true,
  "count": 12,
  "matches": [
    {
      "id": 67890,
      "league": "La Liga",
      "country": "Spain",
      "kickoff": "2026-02-16T14:00:00.000Z",
      "home": "Barcelona",
      "away": "Real Madrid",
      "status": "live",
      "homeScore": 1,
      "awayScore": 2,
      "minute": 78
    }
  ]
}
```

## Logs do Backend

O sistema agora loga detalhadamente:

```
🔧 SportAPI7 Client configurado:
   Host: sportapi7.p.rapidapi.com
   Base URL: https://sportapi7.p.rapidapi.com/api/v1/sport/football
   API Key: ✅ Configurada

🔵 SportAPI7 Request:
   baseURL: https://sportapi7.p.rapidapi.com/api/v1/sport/football
   endpoint: /scheduled-events/2026-02-16
   params: {}
   fullURL: https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/2026-02-16

✅ SportAPI7 Response: 200 (45 eventos)
✅ 45 partidas encontradas para hoje
```

## Testando Localmente

```bash
# Configurar .env
RAPIDAPI_KEY=sua_chave
RAPIDAPI_HOST=sportapi7.p.rapidapi.com

# Rodar servidor
npm start

# Testar endpoints
curl http://localhost:3001/api/matches/today
curl http://localhost:3001/api/matches/live
```

## Status da Integração

✅ Cliente RapidAPI atualizado para SportAPI7  
✅ Cache de 60s implementado no backend  
✅ Logs detalhados de requisições e erros  
✅ Endpoint de partidas de hoje funcionando  
✅ Endpoint de partidas ao vivo funcionando  
✅ Frontend atualizado para consumir API real  
✅ Sanitização de headers implementada  

## Próximos Passos

1. Configure as variáveis no Render
2. Aguarde o deploy automático (~2-3 minutos)
3. Verifique os logs: `Dashboard > Logs`
4. Teste: https://metafy-8qk7.onrender.com/api/matches/today
5. Frontend: https://metafy.vercel.app

## Suporte

Se encontrar erro 404:
- Verifique se `RAPIDAPI_HOST=sportapi7.p.rapidapi.com` está correto
- Confirme a assinatura ativa no painel RapidAPI
- Verifique os logs do Render para ver a URL exata sendo chamada
