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
const MAX_FREE_ANALYSIS = 2;
const PREMIUM_PRICE = 4.50;
const PREMIUM_DURATION_DAYS = 7;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Metafy iniciando...');
  checkPremiumStatus();
  loadAnalysisCount();
  fetchGames();
  updateAnalysisCounter();
  updatePremiumUI();
});

// Verificar status do Premium
function checkPremiumStatus() {
  const premiumData = localStorage.getItem('metafy_premium');
  if (premiumData) {
    const data = JSON.parse(premiumData);
    const premiumEnd = new Date(data.premium_end);
    const now = new Date();
    
    if (now > premiumEnd) {
      console.log('🔒 Premium expirado');
      // Não remove os dados, apenas marca como expirado
    } else {
      const daysLeft = Math.ceil((premiumEnd - now) / (1000 * 60 * 60 * 24));
      console.log(`💎 Premium ativo - ${daysLeft} dias restantes`);
    }
  }
}

// Verificar se usuário é Premium
function isPremiumUser() {
  const premiumData = localStorage.getItem('metafy_premium');
  if (!premiumData) return false;
  
  const data = JSON.parse(premiumData);
  const premiumEnd = new Date(data.premium_end);
  const now = new Date();
  
  return now <= premiumEnd;
}

// Obter dados do Premium
function getPremiumData() {
  const premiumData = localStorage.getItem('metafy_premium');
  if (!premiumData) return null;
  return JSON.parse(premiumData);
}

// Obter dias restantes do Premium
function getPremiumDaysRemaining() {
  const premiumData = localStorage.getItem('metafy_premium');
  if (!premiumData) return 0;
  
  const data = JSON.parse(premiumData);
  const premiumEnd = new Date(data.premium_end);
  const now = new Date();
  
  if (now > premiumEnd) return 0;
  return Math.ceil((premiumEnd - now) / (1000 * 60 * 60 * 24));
}

// Formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Ativar Premium (pagamento único)
function activatePremium() {
  // Simular processo de pagamento
  showPaymentModal();
}

// Confirmar pagamento e ativar Premium
function confirmPayment() {
  const now = new Date();
  const premiumEnd = new Date();
  premiumEnd.setDate(premiumEnd.getDate() + PREMIUM_DURATION_DAYS);
  
  const premiumData = {
    premium_start: now.toISOString(),
    premium_end: premiumEnd.toISOString(),
    price_paid: PREMIUM_PRICE,
    payment_date: now.toISOString()
  };
  
  localStorage.setItem('metafy_premium', JSON.stringify(premiumData));
  
  closeAnalysisModal();
  updateAnalysisCounter();
  updatePremiumUI();
  
  // Mostrar confirmação
  showPremiumConfirmation(premiumData);
}

// Atualizar UI baseado no status Premium
function updatePremiumUI() {
  const isPremium = isPremiumUser();
  const premiumData = getPremiumData();
  
  // Atualizar body class
  document.body.classList.toggle('is-premium-user', isPremium);
  
  // Atualizar botões de análise
  document.querySelectorAll('.btn-analyze').forEach(btn => {
    if (isPremium) {
      btn.classList.add('premium-enabled');
    } else {
      btn.classList.remove('premium-enabled');
    }
  });
}

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
  const counter = document.getElementById('analysisCounter');
  const badge = document.querySelector('.premium-badge');
  
  if (isPremiumUser()) {
    const days = getPremiumDaysRemaining();
    if (counter) counter.innerHTML = `💎 Premium • ${days} dias`;
    if (badge) {
      badge.innerHTML = `<span class="badge-icon">✓</span><span class="badge-text">Premium Ativo</span>`;
      badge.classList.add('active');
    }
  } else {
    const remaining = Math.max(0, MAX_FREE_ANALYSIS - analysisCount);
    if (counter) counter.innerHTML = `⚡ ${remaining}/${MAX_FREE_ANALYSIS} análises restantes`;
    if (badge) {
      badge.innerHTML = `<span class="badge-icon">💎</span><span class="badge-text">Premium</span>`;
      badge.classList.remove('active');
    }
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

  // Premium não tem limite
  if (!isPremiumUser()) {
    // Verificar limite para usuários Free
    if (analysisCount >= MAX_FREE_ANALYSIS) {
      showPremiumModal();
      return;
    }
    // Incrementar apenas para usuários Free
    analysisCount++;
    saveAnalysisCount();
  }
  
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
    remaining: isPremiumUser() ? '∞' : MAX_FREE_ANALYSIS - analysisCount,
    isPremium: isPremiumUser()
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
        <div class="remaining-badge ${analysis.isPremium ? 'premium' : ''}">
          ${analysis.isPremium ? '💎 Premium • Análises ilimitadas' : `⚡ ${analysis.remaining} análises restantes hoje`}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Mostrar modal premium
function showPremiumModal() {
  const premiumData = getPremiumData();
  const wasExpired = premiumData && new Date() > new Date(premiumData.premium_end);
  
  const title = wasExpired ? 'Premium Expirado' : 'Limite Atingido';
  const subtitle = wasExpired 
    ? 'Seu acesso Premium expirou. Renove para continuar!'
    : 'Você usou suas <strong>2 análises gratuitas</strong> de hoje';
  const icon = wasExpired ? '⏰' : '🔒';
  
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };
  modal.innerHTML = `
    <div class="premium-modal">
      <button class="btn-close" onclick="closeAnalysisModal()">✕</button>
      <div class="premium-icon">${icon}</div>
      <h2 class="premium-title">${title}</h2>
      <p class="premium-subtitle">${subtitle}</p>
      
      <div class="premium-offer">
        <div class="offer-badge">PAGAMENTO ÚNICO</div>
        <div class="offer-price">
          <span class="price-currency">R$</span>
          <span class="price-value">4,50</span>
        </div>
        <p class="offer-duration">7 dias de acesso • Sem renovação automática</p>
      </div>

      <div class="premium-features">
        <h4>Desbloqueie agora:</h4>
        <ul>
          <li>✨ Análises de IA <strong>ilimitadas</strong></li>
          <li>📊 Previsões detalhadas</li>
          <li>📈 Probabilidades avançadas</li>
          <li>🎯 Over/Under e BTTS</li>
          <li>💡 Insights exclusivos</li>
        </ul>
      </div>
      
      <button class="btn-premium-cta" onclick="activatePremium()">
        💎 Pagar R$ 4,50 e Liberar Acesso
      </button>
      
      <p class="premium-note">Pagamento único • Acesso imediato • 7 dias</p>
      
      <div class="premium-divider"></div>
      
      <p class="premium-free-note">Ou volte amanhã para mais <strong>2 análises gratuitas</strong></p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Modal de pagamento
function showPaymentModal() {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };
  modal.innerHTML = `
    <div class="payment-modal">
      <button class="btn-close" onclick="closeAnalysisModal()">✕</button>
      
      <div class="payment-header">
        <div class="payment-icon">💳</div>
        <h2>Confirmar Pagamento</h2>
      </div>
      
      <div class="payment-summary">
        <div class="summary-item">
          <span>Plano</span>
          <span>Premium 7 dias</span>
        </div>
        <div class="summary-item">
          <span>Acesso</span>
          <span>Análises Ilimitadas</span>
        </div>
        <div class="summary-item total">
          <span>Total</span>
          <span class="price">R$ 4,50</span>
        </div>
      </div>
      
      <div class="payment-info">
        <p>✅ Pagamento único (sem renovação automática)</p>
        <p>✅ Acesso liberado imediatamente</p>
        <p>✅ Válido por 7 dias corridos</p>
      </div>
      
      <button class="btn-confirm-payment" onclick="confirmPayment()">
        ✅ Confirmar Pagamento - R$ 4,50
      </button>
      
      <button class="btn-cancel" onclick="closeAnalysisModal()">
        Cancelar
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Modal de confirmação do Premium
function showPremiumConfirmation(premiumData) {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };
  modal.innerHTML = `
    <div class="confirmation-modal">
      <div class="confirmation-icon">🎉</div>
      <h2 class="confirmation-title">Premium Ativado!</h2>
      <p class="confirmation-subtitle">Seu acesso Premium está liberado</p>
      
      <div class="confirmation-details">
        <div class="detail-item">
          <span class="detail-label">Início</span>
          <span class="detail-value">${formatDate(premiumData.premium_start)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Expira em</span>
          <span class="detail-value">${formatDate(premiumData.premium_end)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Valor pago</span>
          <span class="detail-value">R$ ${premiumData.price_paid.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="confirmation-benefits">
        <p>💎 Agora você tem acesso a:</p>
        <ul>
          <li>Análises de IA ilimitadas</li>
          <li>Previsões detalhadas</li>
          <li>Insights exclusivos</li>
        </ul>
      </div>
      
      <button class="btn-start" onclick="closeAnalysisModal()">
        🚀 Começar a Usar
      </button>
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
window.activatePremium = activatePremium;
window.confirmPayment = confirmPayment;
window.isPremiumUser = isPremiumUser;
window.getPremiumData = getPremiumData;
window.showPaymentModal = showPaymentModal;
