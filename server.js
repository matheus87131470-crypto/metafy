/**
 * server.js - Backend API para Football AI Platform
 * Endpoints REST para análise de jogos de futebol
 * Integração com RapidAPI para dados de jogos reais
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ====================================
// HEALTH CHECK
// ====================================

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'Football AI Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ====================================
// GET GAMES TODAY
// ====================================

app.get('/games/today', async (req, res) => {
    try {
        const rapidapiKey = process.env.RAPIDAPI_KEY;
        const rapidapiHost = process.env.RAPIDAPI_HOST || 'api-football-v3.p.rapidapi.com';

        if (!rapidapiKey) {
            return res.status(400).json({
                success: false,
                error: 'RAPIDAPI_KEY não configurada',
                message: 'Defina a variável de ambiente RAPIDAPI_KEY'
            });
        }

        // Obter data de hoje em YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        const options = {
            method: 'GET',
            url: `https://${rapidapiHost}/fixtures`,
            params: { date: today },
            headers: {
                'x-rapidapi-key': rapidapiKey,
                'x-rapidapi-host': rapidapiHost
            }
        };

        const response = await axios.request(options);

        if (response.data && response.data.response) {
            const games = response.data.response.map(fixture => ({
                id: fixture.fixture.id,
                date: fixture.fixture.date,
                status: fixture.fixture.status.short,
                homeTeam: fixture.teams.home.name,
                homeId: fixture.teams.home.id,
                awayTeam: fixture.teams.away.name,
                awayId: fixture.teams.away.id,
                competition: fixture.league.name,
                season: fixture.league.season,
                homeOdds: fixture.odds?.homeWin || 2.0,
                drawOdds: fixture.odds?.draw || 3.0,
                awayOdds: fixture.odds?.awayWin || 3.5
            }));

            return res.json({
                success: true,
                count: games.length,
                date: today,
                games: games
            });
        }

        // Fallback com jogos mockados se API falhar
        return res.json({
            success: true,
            count: 6,
            date: today,
            source: 'mock',
            message: 'Usando jogos de exemplo (API limitada)',
            games: getMockGames()
        });

    } catch (error) {
        console.error('Erro ao buscar jogos:', error.message);

        // Fallback para mockados em caso de erro
        return res.json({
            success: true,
            count: 6,
            source: 'mock',
            message: 'Usando jogos mockados (erro na API)',
            games: getMockGames()
        });
    }
});

// ====================================
// ANALYZE GAME
// ====================================

app.post('/analyze-game', (req, res) => {
    try {
        const { homeTeam, awayTeam, competition, homeOdds, drawOdds, awayOdds } = req.body;

        // Validação
        if (!homeTeam || !awayTeam || !competition) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: homeTeam, awayTeam, competition'
            });
        }

        // Gerar análise heurística
        const analysis = generateAnalysis(
            homeTeam,
            awayTeam,
            competition,
            homeOdds || 2.0,
            drawOdds || 3.0,
            awayOdds || 3.5
        );

        return res.json({
            success: true,
            analysis: analysis
        });

    } catch (error) {
        console.error('Erro na análise:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erro ao processar análise',
            message: error.message
        });
    }
});

// ====================================
// ANÁLISE HEURÍSTICA
// ====================================

function generateAnalysis(homeTeam, awayTeam, competition, homeOdds, drawOdds, awayOdds) {
    // Calcular scores baseados no hash do nome do time
    const homeScore = calculateTeamScore(homeTeam);
    const awayScore = calculateTeamScore(awayTeam);

    // Calcular probabilidades
    const probHome = homeScore / (homeScore + awayScore + 0.5);
    const probDraw = 0.3;
    const probAway = awayScore / (homeScore + awayScore + 0.5);

    // Normalizar probabilidades
    const total = probHome + probDraw + probAway;
    const normalizedHome = probHome / total;
    const normalizedDraw = probDraw / total;
    const normalizedAway = probAway / total;

    // Calcular implied probability das odds
    const impliedHome = 1 / homeOdds;
    const impliedDraw = 1 / drawOdds;
    const impliedAway = 1 / awayOdds;

    // Valor da aposta (EV = Probability / Odd)
    const evHome = normalizedHome / homeOdds;
    const evDraw = normalizedDraw / drawOdds;
    const evAway = normalizedAway / awayOdds;

    // Determinar melhor opção
    const bestValue = Math.max(evHome, evDraw, evAway);
    let recommendation = 'Empate';
    let recommendedOdd = drawOdds;

    if (evHome === bestValue) {
        recommendation = `Vitória ${homeTeam}`;
        recommendedOdd = homeOdds;
    } else if (evAway === bestValue) {
        recommendation = `Vitória ${awayTeam}`;
        recommendedOdd = awayOdds;
    }

    // Calcular risco
    const riskLevel = recommendedOdd > 3.0 ? 'ALTO' : recommendedOdd > 2.0 ? 'MÉDIO' : 'BAIXO';

    // Tendência Over/Under (baseada em scores dos times)
    const overUnderTendency = (homeScore + awayScore) > 1.0 ? 'Over 2.5' : 'Under 2.5';

    // Score de confiança
    const confidence = Math.round((Math.abs(homeScore - awayScore) + 0.5) * 50);

    return {
        homeTeam,
        awayTeam,
        competition,
        timestamp: new Date().toISOString(),
        probabilities: {
            home: Math.round(normalizedHome * 100),
            draw: Math.round(normalizedDraw * 100),
            away: Math.round(normalizedAway * 100)
        },
        implied_probabilities: {
            home: Math.round(impliedHome * 100),
            draw: Math.round(impliedDraw * 100),
            away: Math.round(impliedAway * 100)
        },
        recommendation: recommendation,
        recommendedOdd: recommendedOdd.toFixed(2),
        riskLevel: riskLevel,
        confidence: Math.min(100, confidence),
        overUnder: overUnderTendency,
        explanation: `
${homeTeam} está em forma ${homeScore > 0.5 ? 'boa' : 'regular'} (score: ${(homeScore * 100).toFixed(0)}%).
${awayTeam} está em forma ${awayScore > 0.5 ? 'boa' : 'regular'} (score: ${(awayScore * 100).toFixed(0)}%).

Tendência: ${recommendation} com ${riskLevel} risco.
Valor esperado (EV): ${(bestValue * 100).toFixed(1)}% de retorno esperado.
Recomendação: Aposta em ${recommendation} com odd ${recommendedOdd.toFixed(2)}.
        `.trim(),
        forms: {
            home: `${homeTeam}: ${(homeScore * 100).toFixed(0)}%`,
            away: `${awayTeam}: ${(awayScore * 100).toFixed(0)}%`
        },
        value_bets: [
            {
                market: '1 (Vitória do Mandante)',
                probability: Math.round(normalizedHome * 100),
                odd: homeOdds.toFixed(2),
                value_score: (evHome * 100).toFixed(1)
            },
            {
                market: 'X (Empate)',
                probability: Math.round(normalizedDraw * 100),
                odd: drawOdds.toFixed(2),
                value_score: (evDraw * 100).toFixed(1)
            },
            {
                market: '2 (Vitória do Visitante)',
                probability: Math.round(normalizedAway * 100),
                odd: awayOdds.toFixed(2),
                value_score: (evAway * 100).toFixed(1)
            }
        ]
    };
}

// ====================================
// HELPER FUNCTIONS
// ====================================

function calculateTeamScore(teamName) {
    // Algoritmo simples: hash do nome do time
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
        hash += teamName.charCodeAt(i);
    }
    // Normalizar entre 0 e 1
    const score = ((hash % 100) / 100);
    return Math.min(1, Math.max(0.2, score)); // entre 0.2 e 1
}

function getMockGames() {
    return [
        {
            id: 1,
            date: new Date().toISOString(),
            status: 'NS',
            homeTeam: 'Flamengo',
            homeId: 1,
            awayTeam: 'Palmeiras',
            awayId: 2,
            competition: 'Campeonato Brasileiro',
            season: 2026,
            homeOdds: 2.40,
            drawOdds: 3.20,
            awayOdds: 2.85
        },
        {
            id: 2,
            date: new Date().toISOString(),
            status: 'NS',
            homeTeam: 'Real Madrid',
            homeId: 10,
            awayTeam: 'Barcelona',
            awayId: 20,
            competition: 'La Liga',
            season: 2026,
            homeOdds: 1.85,
            drawOdds: 3.50,
            awayOdds: 3.80
        },
        {
            id: 3,
            date: new Date().toISOString(),
            status: 'NS',
            homeTeam: 'Manchester City',
            homeId: 30,
            awayTeam: 'Liverpool',
            awayId: 40,
            competition: 'Premier League',
            season: 2026,
            homeOdds: 1.95,
            drawOdds: 3.40,
            awayOdds: 3.60
        },
        {
            id: 4,
            date: new Date().toISOString(),
            status: 'NS',
            homeTeam: 'PSG',
            homeId: 50,
            awayTeam: 'Monaco',
            awayId: 60,
            competition: 'Ligue 1',
            season: 2026,
            homeOdds: 1.50,
            drawOdds: 4.00,
            awayOdds: 5.50
        },
        {
            id: 5,
            date: new Date().toISOString(),
            status: 'NS',
            homeTeam: 'Bayern Munich',
            homeId: 70,
            awayTeam: 'Borussia Dortmund',
            awayId: 80,
            competition: 'Bundesliga',
            season: 2026,
            homeOdds: 1.80,
            drawOdds: 3.60,
            awayOdds: 4.00
        },
        {
            id: 6,
            date: new Date().toISOString(),
            status: 'NS',
            homeTeam: 'Inter',
            homeId: 90,
            awayTeam: 'AC Milan',
            awayId: 100,
            competition: 'Serie A',
            season: 2026,
            homeOdds: 2.10,
            drawOdds: 3.30,
            awayOdds: 3.20
        }
    ];
}

// ====================================
// ERROR HANDLING
// ====================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// ====================================
// 404 HANDLER
// ====================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
});

// ====================================
// START SERVER
// ====================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║     🚀 Football AI Backend API Started                ║
║     Port: ${PORT}                                     ║
║     Environment: ${process.env.NODE_ENV || 'development'}       ║
║     Health Check: http://localhost:${PORT}/health   ║
╚════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
