// App principal - Orquestra todos os componentes

// Dados demo (inline para funcionar sem módulos ES6)
const MOCK_GAMES = [
  {
    id: 1,
    homeTeam: 'Flamengo',
    awayTeam: 'Palmeiras',
    homeFlag: '🔴⚫',
    awayFlag: '🟢⚪',
    competition: 'Brasileirão Série A',
    competitionLogo: '🇧🇷',
    country: 'Brazil',
    time: '16:00',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    homeOdds: 2.10,
    drawOdds: 3.25,
    awayOdds: 3.40,
    stadium: 'Maracanã',
    homeForm: ['W', 'W', 'D', 'W', 'L'],
    awayForm: ['W', 'D', 'W', 'W', 'W'],
    h2h: { homeWins: 5, draws: 3, awayWins: 4 }
  },
  {
    id: 2,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeFlag: '⚪🟣',
    awayFlag: '🔵🔴',
    competition: 'La Liga',
    competitionLogo: '🇪🇸',
    country: 'Spain',
    time: '17:00',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    homeOdds: 2.30,
    drawOdds: 3.10,
    awayOdds: 2.90,
    stadium: 'Santiago Bernabéu',
    homeForm: ['W', 'W', 'W', 'D', 'W'],
    awayForm: ['W', 'L', 'W', 'W', 'D'],
    h2h: { homeWins: 8, draws: 4, awayWins: 6 }
  },
  {
    id: 3,
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeFlag: '🔵⚪',
    awayFlag: '🔴⚪',
    competition: 'Premier League',
    competitionLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    country: 'England',
    time: '14:30',
    status: 'live',
    homeScore: 2,
    awayScore: 1,
    homeOdds: 1.85,
    drawOdds: 3.50,
    awayOdds: 4.20,
    stadium: 'Etihad Stadium',
    minute: 67,
    homeForm: ['W', 'W', 'W', 'W', 'W'],
    awayForm: ['W', 'W', 'D', 'W', 'L'],
    h2h: { homeWins: 7, draws: 5, awayWins: 8 }
  },
  {
    id: 4,
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    homeFlag: '🔵🔴',
    awayFlag: '⚪🔵',
    competition: 'Ligue 1',
    competitionLogo: '🇫🇷',
    country: 'France',
    time: '21:00',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    homeOdds: 1.65,
    drawOdds: 3.80,
    awayOdds: 5.50,
    stadium: 'Parc des Princes',
    homeForm: ['W', 'W', 'W', 'W', 'D'],
    awayForm: ['D', 'W', 'L', 'W', 'D'],
    h2h: { homeWins: 10, draws: 2, awayWins: 3 }
  },
  {
    id: 5,
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    homeFlag: '🔴⚪',
    awayFlag: '🟡⚫',
    competition: 'Bundesliga',
    competitionLogo: '🇩🇪',
    country: 'Germany',
    time: '15:30',
    status: 'live',
    homeScore: 1,
    awayScore: 1,
    homeOdds: 1.75,
    drawOdds: 3.60,
    awayOdds: 4.80,
    stadium: 'Allianz Arena',
    minute: 45,
    homeForm: ['W', 'D', 'W', 'W', 'W'],
    awayForm: ['W', 'W', 'L', 'W', 'D'],
    h2h: { homeWins: 9, draws: 3, awayWins: 4 }
  },
  {
    id: 6,
    homeTeam: 'Corinthians',
    awayTeam: 'São Paulo',
    homeFlag: '⚫⚪',
    awayFlag: '⚪🔴⚫',
    competition: 'Brasileirão Série A',
    competitionLogo: '🇧🇷',
    country: 'Brazil',
    time: '19:00',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    homeOdds: 2.50,
    drawOdds: 3.10,
    awayOdds: 2.80,
    stadium: 'Neo Química Arena',
    homeForm: ['L', 'D', 'W', 'L', 'W'],
    awayForm: ['W', 'W', 'D', 'W', 'W'],
    h2h: { homeWins: 6, draws: 4, awayWins: 5 }
  }
];

// Estado global
let GAMES = [];
let isDemo = true;
let analysisCount = 0;
const MAX_FREE_ANALYSIS = 3;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Metafy iniciando...');
  loadAnalysisCount();
  fetchGames();
  updateAnalysisCounter();
});

// Carregar contador de análises
function loadAnalysisCount() {
  const today = new Date().toDateString();
  const saved = localStorage.getItem('metafy_analysis');
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === today) {
      analysisCount = data.count;
    }
  }
}

// Salvar contador de análises
function saveAnalysisCount() {
  localStorage.setItem('metafy_analysis', JSON.stringify({
    date: new Date().toDateString(),
    count: analysisCount
  }));
}

// Atualizar contador na UI
function updateAnalysisCounter() {
  const remaining = Math.max(0, MAX_FREE_ANALYSIS - analysisCount);
  const counter = document.getElementById('analysisCounter');
  if (counter) {
    counter.innerHTML = `⚡ ${remaining}/${MAX_FREE_ANALYSIS} análises restantes`;
  }
}

// Buscar jogos
async function fetchGames() {
  const container = document.getElementById('gamesList');
  if (!container) return;

  // Mostrar loading
  container.innerHTML = createLoader('Carregando jogos...');

  try {
    // Tentar API real primeiro
    const response = await fetch('/api/games');
    const data = await response.json();

    if (data.success && data.games?.length > 0) {
      GAMES = data.games.map(g => ({
        ...g,
        status: g.status === 'HOJE' ? 'scheduled' : 
                g.status === 'LIVE' ? 'live' : 
                g.status === 'FIM' ? 'finished' : g.status,
        homeForm: ['W', 'D', 'W', 'L', 'W'],
        awayForm: ['D', 'W', 'W', 'W', 'L'],
        h2h: { homeWins: 5, draws: 3, awayWins: 4 }
      }));
      isDemo = data.demo || false;
    } else {
      // Usar dados demo
      GAMES = MOCK_GAMES;
      isDemo = true;
    }
  } catch (error) {
    console.warn('⚠️ API indisponível, usando dados demo');
    GAMES = MOCK_GAMES;
    isDemo = true;
  }

  // Atualizar banner demo
  if (isDemo) {
    document.body.classList.add('has-demo-banner');
    showDemoBanner();
  }

  // Renderizar jogos
  renderGames();
}

// Mostrar banner demo
function showDemoBanner() {
  if (document.getElementById('demoBanner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'demoBanner';
  banner.className = 'demo-banner';
  banner.innerHTML = `
    <span class="demo-icon">🧪</span>
    <span class="demo-text">Modo demonstração — dados simulados</span>
  `;
  document.body.prepend(banner);
}

// Criar loader
function createLoader(message) {
  return `
    <div class="loader-container">
      <div class="loader-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loader-text">${message}</p>
    </div>
  `;
}

// Renderizar jogos
function renderGames() {
  const container = document.getElementById('gamesList');
  if (!container) return;

  if (GAMES.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>⚽ Nenhum jogo disponível no momento</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  const gamesContainer = document.createElement('div');
  gamesContainer.className = 'games-container';

  GAMES.forEach(game => {
    gamesContainer.innerHTML += createGameCard(game);
  });

  container.appendChild(gamesContainer);
}

// Criar card de jogo
function createGameCard(game) {
  const statusClass = game.status === 'live' ? 'status-live' : 
                      game.status === 'finished' ? 'status-finished' : 'status-scheduled';
  
  const statusText = game.status === 'live' ? `🔴 AO VIVO ${game.minute ? `• ${game.minute}'` : ''}` :
                     game.status === 'finished' ? '✓ FINALIZADO' :
                     `⏰ ${game.time}`;

  const score = game.status === 'scheduled' ? 
    '<span class="score-vs">VS</span>' :
    `<span class="score-number">${game.homeScore ?? 0}</span>
     <span class="score-separator">-</span>
     <span class="score-number">${game.awayScore ?? 0}</span>`;

  return `
    <div class="game-card" data-game-id="${game.id}">
      <div class="game-card-header">
        <span class="competition-badge">
          <span class="competition-flag">${game.competitionLogo || '⚽'}</span>
          <span class="competition-name">${game.competition}</span>
        </span>
        <span class="game-status ${statusClass}">${statusText}</span>
      </div>

      <div class="game-card-body">
        <div class="team-row">
          <div class="team-info">
            <span class="team-flag">${game.homeFlag || '🏠'}</span>
            <span class="team-name">${game.homeTeam}</span>
          </div>
          <div class="team-odds ${game.homeOdds < game.awayOdds ? 'odds-favorite' : ''}">${game.homeOdds.toFixed(2)}</div>
        </div>

        <div class="score-display">
          ${score}
        </div>

        <div class="team-row">
          <div class="team-info">
            <span class="team-flag">${game.awayFlag || '✈️'}</span>
            <span class="team-name">${game.awayTeam}</span>
          </div>
          <div class="team-odds ${game.awayOdds < game.homeOdds ? 'odds-favorite' : ''}">${game.awayOdds.toFixed(2)}</div>
        </div>
      </div>

      <div class="game-card-odds">
        <div class="odd-box">
          <span class="odd-label">1</span>
          <span class="odd-value">${game.homeOdds.toFixed(2)}</span>
        </div>
        <div class="odd-box">
          <span class="odd-label">X</span>
          <span class="odd-value">${game.drawOdds.toFixed(2)}</span>
        </div>
        <div class="odd-box">
          <span class="odd-label">2</span>
          <span class="odd-value">${game.awayOdds.toFixed(2)}</span>
        </div>
      </div>

      <div class="game-card-footer">
        <button class="btn-analyze" onclick="analyzeGame(${game.id})">
          <span class="btn-icon">✨</span>
          <span class="btn-text">Analisar com IA</span>
        </button>
      </div>
    </div>
  `;
}

// Analisar jogo
function analyzeGame(gameId) {
  const game = GAMES.find(g => g.id === gameId);
  if (!game) return;

  // Verificar limite
  if (analysisCount >= MAX_FREE_ANALYSIS) {
    showPremiumModal();
    return;
  }

  // Incrementar contador
  analysisCount++;
  saveAnalysisCount();
  updateAnalysisCounter();

  // Gerar análise
  const analysis = generateAnalysis(game);
  showAnalysisModal(game, analysis);
}

// Gerar análise
function generateAnalysis(game) {
  const homeWinProb = calculateProbability(game.homeOdds);
  const drawProb = calculateProbability(game.drawOdds);
  const awayWinProb = calculateProbability(game.awayOdds);

  const homeFormScore = calculateFormScore(game.homeForm);
  const awayFormScore = calculateFormScore(game.awayForm);

  // Previsão
  const max = Math.max(homeWinProb, drawProb, awayWinProb);
  let prediction;
  if (max === homeWinProb) {
    prediction = { result: 'home', team: game.homeTeam, probability: Math.round(homeWinProb), text: `Vitória do ${game.homeTeam}` };
  } else if (max === awayWinProb) {
    prediction = { result: 'away', team: game.awayTeam, probability: Math.round(awayWinProb), text: `Vitória do ${game.awayTeam}` };
  } else {
    prediction = { result: 'draw', team: null, probability: Math.round(drawProb), text: 'Empate provável' };
  }

  // Confiança
  const probDiff = Math.abs(homeWinProb - awayWinProb);
  const formDiff = Math.abs(homeFormScore - awayFormScore);
  const confidence = probDiff > 20 && formDiff > 20 ? 'high' : probDiff > 10 || formDiff > 15 ? 'medium' : 'low';

  // Over/Under
  const avgOdds = (game.homeOdds + game.awayOdds) / 2;
  let overProb = avgOdds < 2 ? 62 : avgOdds < 2.5 ? 58 : avgOdds > 3 ? 48 : 55;

  // BTTS
  let bttsProb = 50;
  if (homeFormScore > 60 && awayFormScore > 60) bttsProb = 65;
  else if (homeFormScore > 70 || awayFormScore > 70) bttsProb = 58;
  else if (homeFormScore < 40 || awayFormScore < 40) bttsProb = 42;

  // Reasoning
  const reasoning = [];
  if (game.homeOdds < game.awayOdds) reasoning.push(`${game.homeTeam} tem vantagem como mandante`);
  if (homeFormScore > awayFormScore + 15) reasoning.push(`Forma recente favorece o ${game.homeTeam}`);
  else if (awayFormScore > homeFormScore + 15) reasoning.push(`${game.awayTeam} em melhor momento`);
  if (game.h2h && game.h2h.homeWins > game.h2h.awayWins + 2) reasoning.push('Histórico favorável ao mandante');
  if (reasoning.length === 0) reasoning.push('Análise baseada em odds, forma e mando de campo');

  return {
    prediction,
    probabilities: {
      home: Math.round(homeWinProb),
      draw: Math.round(drawProb),
      away: Math.round(awayWinProb)
    },
    markets: {
      overUnder: { over25: overProb, under25: 100 - overProb },
      btts: { yes: bttsProb, no: 100 - bttsProb }
    },
    confidence,
    form: { home: homeFormScore, away: awayFormScore },
    reasoning,
    remaining: MAX_FREE_ANALYSIS - analysisCount
  };
}

function calculateProbability(odds) {
  const rawProb = (1 / odds) * 100;
  return Math.min(95, Math.max(5, rawProb * 0.95));
}

function calculateFormScore(form) {
  if (!form) return 50;
  const points = { W: 3, D: 1, L: 0 };
  const total = form.reduce((sum, r) => sum + (points[r] || 0), 0);
  return Math.round((total / 15) * 100);
}

// Mostrar modal de análise
function showAnalysisModal(game, analysis) {
  const confidenceClass = analysis.confidence === 'high' ? 'confidence-high' :
                         analysis.confidence === 'medium' ? 'confidence-medium' : 'confidence-low';
  const confidenceText = analysis.confidence === 'high' ? '🟢 Alta' :
                        analysis.confidence === 'medium' ? '🟡 Média' : '🔴 Baixa';

  const formDisplay = (form) => {
    if (!form) return '';
    return form.map(r => {
      const cls = r === 'W' ? 'form-win' : r === 'D' ? 'form-draw' : 'form-loss';
      return `<span class="form-badge ${cls}">${r}</span>`;
    }).join('');
  };

  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };
  modal.innerHTML = `
    <div class="analysis-modal">
      <div class="analysis-header">
        <div class="analysis-title">
          <span class="ai-icon">🧠</span>
          <span>Análise IA</span>
        </div>
        <button class="btn-close" onclick="closeAnalysisModal()">✕</button>
      </div>

      <div class="analysis-match">
        <div class="match-teams">
          <span class="team">${game.homeTeam}</span>
          <span class="vs">vs</span>
          <span class="team">${game.awayTeam}</span>
        </div>
        <div class="match-competition">${game.competitionLogo || '⚽'} ${game.competition}</div>
      </div>

      <div class="analysis-prediction">
        <div class="prediction-main">
          <span class="prediction-label">Previsão</span>
          <span class="prediction-value">${analysis.prediction.text}</span>
          <span class="prediction-prob">${analysis.prediction.probability}%</span>
        </div>
        <div class="confidence-badge ${confidenceClass}">Confiança: ${confidenceText}</div>
      </div>

      <div class="analysis-section">
        <h4 class="section-title">📊 Probabilidades</h4>
        <div class="prob-bars">
          <div class="prob-item">
            <span class="prob-label">${game.homeTeam}</span>
            <div class="prob-bar"><div class="prob-fill home" style="width: ${analysis.probabilities.home}%"></div></div>
            <span class="prob-value">${analysis.probabilities.home}%</span>
          </div>
          <div class="prob-item">
            <span class="prob-label">Empate</span>
            <div class="prob-bar"><div class="prob-fill draw" style="width: ${analysis.probabilities.draw}%"></div></div>
            <span class="prob-value">${analysis.probabilities.draw}%</span>
          </div>
          <div class="prob-item">
            <span class="prob-label">${game.awayTeam}</span>
            <div class="prob-bar"><div class="prob-fill away" style="width: ${analysis.probabilities.away}%"></div></div>
            <span class="prob-value">${analysis.probabilities.away}%</span>
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <h4 class="section-title">🎯 Mercados</h4>
        <div class="markets-grid">
          <div class="market-card">
            <span class="market-name">Over 2.5 Gols</span>
            <span class="market-value ${analysis.markets.overUnder.over25 > 50 ? 'positive' : 'negative'}">${analysis.markets.overUnder.over25}%</span>
          </div>
          <div class="market-card">
            <span class="market-name">Under 2.5 Gols</span>
            <span class="market-value ${analysis.markets.overUnder.under25 > 50 ? 'positive' : 'negative'}">${analysis.markets.overUnder.under25}%</span>
          </div>
          <div class="market-card">
            <span class="market-name">Ambas Marcam</span>
            <span class="market-value ${analysis.markets.btts.yes > 50 ? 'positive' : 'negative'}">Sim ${analysis.markets.btts.yes}%</span>
          </div>
          <div class="market-card">
            <span class="market-name">Não Ambas</span>
            <span class="market-value ${analysis.markets.btts.no > 50 ? 'positive' : 'negative'}">${analysis.markets.btts.no}%</span>
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <h4 class="section-title">📈 Forma Recente</h4>
        <div class="form-display">
          <div class="form-team">
            <span class="form-team-name">${game.homeTeam}</span>
            <div class="form-badges">${formDisplay(game.homeForm)}</div>
          </div>
          <div class="form-team">
            <span class="form-team-name">${game.awayTeam}</span>
            <div class="form-badges">${formDisplay(game.awayForm)}</div>
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <h4 class="section-title">💡 Análise</h4>
        <ul class="reasoning-list">
          ${analysis.reasoning.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="analysis-footer">
        <div class="remaining-badge">⚡ ${analysis.remaining} análises restantes hoje</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Mostrar modal premium
function showPremiumModal() {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };
  modal.innerHTML = `
    <div class="premium-modal">
      <button class="btn-close" onclick="closeAnalysisModal()">✕</button>
      <div class="premium-icon">💎</div>
      <h2 class="premium-title">Limite Atingido</h2>
      <p class="premium-subtitle">Você usou suas 3 análises gratuitas de hoje</p>
      <div class="premium-features">
        <h4>Desbloqueie o Premium:</h4>
        <ul>
          <li>✨ Análises ilimitadas</li>
          <li>📊 Dados avançados</li>
          <li>📈 Histórico completo</li>
          <li>🎯 Over/Under e BTTS</li>
        </ul>
      </div>
      <button class="btn-premium-cta" disabled>🚀 Em breve</button>
      <p class="premium-note">Volte amanhã para mais 3 análises gratuitas!</p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Fechar modal
function closeAnalysisModal() {
  const modal = document.querySelector('.analysis-modal-overlay');
  if (modal) modal.remove();
}

// Expor funções globais
window.analyzeGame = analyzeGame;
window.closeAnalysisModal = closeAnalysisModal;
