# Configuração RapidAPI - API-Football

## Como Encontrar o Host Correto

1. Acesse https://rapidapi.com/api-sports/api/api-football/
2. Faça login na sua conta RapidAPI
3. No painel da direita, em "Code Snippets", você verá:
   ```
   X-RapidAPI-Key: SUA_CHAVE_AQUI
   X-RapidAPI-Host: api-football-beta.p.rapidapi.com
   ```
4. Copie o valor do `X-RapidAPI-Host`

## Variáveis de Ambiente

Configure no Render (ou .env local):

```bash
RAPIDAPI_KEY=sua_chave_aqui
RAPIDAPI_HOST=api-football-beta.p.rapidapi.com
```

## Hosts Comuns

- `api-football-beta.p.rapidapi.com` (versão beta - RECOMENDADO)
- `api-football-v1.p.rapidapi.com` (versão 1)
- `v3.football.api-sports.io` (API Sports direto - requer configuração diferente)

## Endpoints Usados

Todos os endpoints seguem o padrão `/v3/ENDPOINT`:

- `GET /v3/fixtures?date=YYYY-MM-DD&timezone=America/Sao_Paulo`
- `GET /v3/fixtures?id=FIXTURE_ID`
- `GET /v3/odds?fixture=FIXTURE_ID&bookmaker=1`
- `GET /v3/fixtures/statistics?fixture=FIXTURE_ID`
- `GET /v3/fixtures/headtohead?h2h=TEAM1_ID-TEAM2_ID&last=5`

## Verificação de Logs

Com as alterações feitas, agora o servidor logará:
- ✅ Base URL completa
- ✅ Endpoint chamado
- ✅ Parâmetros enviados
- ✅ URL final montada
- ✅ Status da resposta (sucesso ou erro detalhado)

## Testando Localmente

```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Testar endpoint
curl http://localhost:3001/api/matches/today
```

Os logs mostrarão exatamente qual URL está sendo chamada.
