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
let LIVE_GAMES = [];
let isDemo = true;
let analysisCount = 0;
const MAX_FREE_ANALYSIS = 2;
const PREMIUM_PRICE = 3.50;
const PREMIUM_DURATION_DAYS = 7;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Metafy iniciando...');
  
  // Verificar autenticação primeiro
  await checkAuth();
  
  // Verificar retorno do Mercado Pago
  checkPaymentReturn();
  
  // Inicializar userId e buscar status do backend
  getUserId();
  await fetchUserStatus();
  
  checkPremiumStatus();
  loadAnalysisCount();
  fetchGames();
  // fetchLiveMatches(); // DESABILITADO: evitar erro 429 (Too Many Requests)
  updateAnalysisCounter();
  updatePremiumUI();
  updateAuthUI(); // Atualizar botões de login/logout

  // Delegacao de clique para analisar
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action="analisar"]');
    if (!target) return;

    event.preventDefault();
    const matchId = target.getAttribute('data-match-id');
    if (!matchId) return;

    if (typeof window.togglePredictionBlock === 'function') {
      window.togglePredictionBlock(matchId);
    }
  });
  
  // Auto-formatar CPF ao digitar
  const cpfInput = document.getElementById('cpfInput');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      e.target.value = formatCPF(e.target.value);
    });
  }
  
  // Atualizar jogos ao vivo a cada 30 segundos
  // setInterval(fetchLiveMatches, 30000); // DESABILITADO: evitar erro 429
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

// Verificar se usuário é Premium (do cache local)
function isPremiumUser() {
  return userStatusCache?.isPremium || false;
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

// Ativar Premium (pagamento PIX via Mercado Pago)
const BACKEND_URL = 'https://metafy-8qk7.onrender.com';
let paymentCheckInterval = null;

// Gerar ou recuperar userId único
function getUserId() {
  // Se está logado, usar ID do usuário autenticado
  if (currentUser && currentUser.id) {
    return currentUser.id;
  }
  
  // Se não está logado, usar ID anônimo persistente
  let userId = localStorage.getItem('metafy_user_id');
  
  if (!userId) {
    // Gerar ID único baseado em timestamp + random
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('metafy_user_id', userId);
    console.log('🆔 Novo userId criado:', userId);
  }
  
  return userId;
}

function getCurrentUserId() {
  return getUserId();
}

// Estado do usuário (cache local)
let userStatusCache = null;

// Buscar status do usuário do backend
async function fetchUserStatus() {
  try {
    const userId = getUserId();
    
    // Se está autenticado, usar token
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/me?userId=${userId}`, { headers });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar status');
    }
    
    const data = await response.json();
    userStatusCache = data;
    
    console.log('👤 Status do usuário:', {
      isPremium: data.isPremium,
      freeRemaining: data.freeRemaining,
      daysRemaining: data.daysRemaining
    });
    
    // Atualizar UI com contador
    updateAnalysisCounter();
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    return null;
  }
}

// Atualizar contador de análises na UI
function updateAnalysisCounter() {
  if (!userStatusCache) return;
  
  const counterElements = document.querySelectorAll('.analysis-counter');
  counterElements.forEach(el => {
    if (userStatusCache.isPremium) {
      el.textContent = `Premium ativo (${userStatusCache.daysRemaining} dias)`;
      el.classList.add('premium');
    } else {
      el.textContent = `Análises restantes: ${userStatusCache.freeRemaining}/2`;
      el.classList.remove('premium');
    }
  });
}

function activatePremium() {
  showPaymentModal();
}

// Modal PIX antigo removido - agora usa showPaymentModal() que redireciona para Mercado Pago
function openPixModal() {
  // Deprecado - usar showPaymentModal()
  showPaymentModal();
}

// Funções de validação (ainda usadas no auto-formatar CPF)
function validateCPF(cpf) {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function formatCPF(value) {
  const numbers = value.replace(/\D/g, '');
  
  // Formata: 000.000.000-00
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return numbers.slice(0, 11);
}

// Função deprecada - agora usa Mercado Pago Checkout Pro
async function generatePixPayment() {
  console.warn('⚠️ generatePixPayment() deprecado - usando Mercado Pago');
  closePixModal();
  showPaymentModal();
}

// Modal PIX antigo deprecado - agora fecha qualquer modal  
function closePixModal() {
  const oldModal = document.getElementById('pixPaymentModal');
  if (oldModal) oldModal.style.display = 'none';
  
  // Fechar modal novo também
  closeAnalysisModal();
  
  // Parar verificação
  if (paymentCheckInterval) {
    clearInterval(paymentCheckInterval);
    paymentCheckInterval = null;
  }
}

// Função deprecada - modal antigo não é mais usado
function resetPixModal() {
  console.warn('⚠️ resetPixModal() deprecado');
  // Não faz nada - modal antigo removido
}

// Função deprecada - modal antigo não é mais usado
function copyPixCode() {
  console.warn('⚠️ copyPixCode() deprecado');
  return false;
}

// Função deprecada - agora o webhook do Mercado Pago ativa automaticamente
// Função deprecada - agora o webhook do Mercado Pago ativa automaticamente
function startPaymentCheck() {
  console.warn('⚠️ startPaymentCheck() deprecado - webhook do MP ativa premium automaticamente');
  return null;
}

// Confirmar pagamento e redirecionar para Mercado Pago
async function confirmPayment() {
  if (!currentUser) {
    alert('⚠️ Você precisa estar logado para assinar Premium');
    showLoginModal();
    return;
  }

  try {
    // Mostrar loading
    const btn = document.querySelector('.btn-confirm-payment');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Criando checkout...';
    }

    // Criar checkout no backend
    const response = await fetch(`${BACKEND_URL}/api/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId: currentUser.id })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Erro ao criar checkout');
    }

    // Redirecionar para Mercado Pago
    console.log('✅ Redirecionando para Mercado Pago...');
    window.location.href = data.init_point;

  } catch (error) {
    console.error('❌ Erro ao criar checkout:', error);
    alert(`❌ Erro ao processar pagamento: ${error.message}`);
    
    // Restaurar botão
    const btn = document.querySelector('.btn-confirm-payment');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '💳 Pagar com Mercado Pago - R$ 3,50';
    }
  }
}

// Verificar retorno do pagamento do Mercado Pago
function checkPaymentReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  
  if (!paymentStatus) return;
  
  // Limpar URL sem recarregar página
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
  
  if (paymentStatus === 'success') {
    // Aguardar alguns segundos e recarregar status do usuário
    setTimeout(async () => {
      await fetchUserStatus();
      updateAnalysisCounter();
      updatePremiumUI();
      
      alert('🎉 Pagamento aprovado! Seu Premium foi ativado com sucesso!');
    }, 2000);
  } else if (paymentStatus === 'pending') {
    alert('⏳ Seu pagamento está sendo processado. O Premium será ativado automaticamente quando aprovado.');
  } else if (paymentStatus === 'failure') {
    alert('❌ O pagamento não foi concluído. Tente novamente ou entre em contato com o suporte.');
  }
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
  container.innerHTML = createLoader('Carregando jogos reais...');

  try {
    // Usar API real do backend (SportAPI7)
    console.log('🔄 Buscando partidas de hoje via SportAPI7...');
    const response = await fetch(`${BACKEND_URL}/api/matches/today`);
    
    // Verificar se resposta HTTP foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}:`, errorText);
      throw new Error(`Erro ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();

    // Log de debug para verificar estrutura
    console.log('API /matches/today response:', data);

    // Normalizar retorno (suportar múltiplos formatos)
    const rawMatches = Array.isArray(data) ? data : (data.matches || data.events || []);
    const matches = rawMatches
      .filter(Boolean)
      .map((m) => ({
        id: m.id,
        league: m.league || m.tournament?.name || m.competition?.name || "—",
        country: m.country || m.tournament?.category?.name || "—",
        kickoff: m.kickoff || m.startTimestamp || m.startDate || "",
        status: m.status || "unknown",
        home: m.home || m.homeTeam?.name || m.home?.name || "—",
        away: m.away || m.awayTeam?.name || m.away?.name || "—",
        homeScore: (typeof m.homeScore === "number" ? m.homeScore : m.homeScore?.current) ?? null,
        awayScore: (typeof m.awayScore === "number" ? m.awayScore : m.awayScore?.current) ?? null,
      }));

    // Log de debug das partidas normalizadas
    console.log('Normalized matches:', matches.slice(0, 3));

    if (matches.length > 0) {
      GAMES = matches.map(match => ({
        id: match.id,
        homeTeam: match.home,
        awayTeam: match.away,
        competition: match.league,
        country: match.country,
        time: match.kickoff ? new Date(match.kickoff).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—',
        status: match.status,
        homeScore: match.homeScore ?? 0,
        awayScore: match.awayScore ?? 0,
        // Odds simuladas (SportAPI7 não fornece odds facilmente)
        homeOdds: 2.0 + Math.random() * 2,
        drawOdds: 3.0 + Math.random(),
        awayOdds: 2.0 + Math.random() * 2
      }));
      
      console.log(`✅ ${GAMES.length} partidas REAIS carregadas da SportAPI7`);
    } else {
      // API respondeu 200 mas sem partidas (count = 0)
      throw new Error('Nenhuma partida encontrada para hoje nas ligas principais');
    }
  } catch (error) {
    console.error('❌ Erro ao buscar partidas:', error);
    container.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-text">Erro ao carregar partidas</p>
        <p class="error-details">${error.message}</p>
        <button onclick="fetchGames()" class="btn-retry">Tentar Novamente</button>
      </div>
    `;
    return;
  }

  // Renderizar jogos
  renderGames();
}

// Buscar partidas ao vivo
async function fetchLiveMatches() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/matches/live`);
    
    if (!response.ok) {
      console.warn(`⚠️ Erro ao buscar jogos ao vivo: ${response.status}`);
      return;
    }

    const data = await response.json();

    if (data.success && data.matches?.length > 0) {
      LIVE_GAMES = data.matches.map(match => ({
        id: match.id,
        homeTeam: match.home,
        awayTeam: match.away,
        competition: match.league,
        country: match.country,
        time: 'AO VIVO',
        status: 'LIVE',
        homeScore: match.homeScore ?? 0,
        awayScore: match.awayScore ?? 0,
        homeOdds: 2.0 + Math.random() * 2,
        drawOdds: 3.0 + Math.random(),
        awayOdds: 2.0 + Math.random() * 2,
        minute: match.minute || '45\''
      }));
      
      console.log(`🔴 ${LIVE_GAMES.length} partidas AO VIVO`);
      renderGames(); // Re-renderizar para incluir jogos ao vivo
    } else {
      LIVE_GAMES = [];
    }
  } catch (error) {
    console.error('❌ Erro ao buscar jogos ao vivo:', error);
    LIVE_GAMES = [];
  }
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
function renderGames(gamesInput = GAMES) {
  const container = document.getElementById('gamesList');
  if (!container) return;

  const games = Array.isArray(gamesInput) ? gamesInput : GAMES;

  let html = '';

  // Seção de jogos ao vivo
  if (LIVE_GAMES.length > 0) {
    html += `
      <div class="live-games-section">
        <h2 class="section-title">
          <span class="live-indicator">🔴</span>
          AO VIVO <span class="live-count">(${LIVE_GAMES.length})</span>
        </h2>
        <div class="games-grid">
    `;
    
    LIVE_GAMES.forEach(game => {
      html += createGameCard(game, true);
    });
    
    html += `
        </div>
      </div>
    `;
  }

  // Jogos agendados
  if (games.length === 0 && LIVE_GAMES.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚽</div>
        <h3>Nenhum jogo disponível</h3>
        <p>Tente ajustar os filtros ou volte mais tarde</p>
      </div>
    `;
    return;
  }

  // Usar novo componente se disponível
  if (typeof renderGamesByLeague === 'function') {
    // Renderizar jogos ao vivo em destaque
    let html = '';
    if (typeof renderLiveGamesSection === 'function') {
      html += renderLiveGamesSection(games);
    }
    
    // Renderizar filtros se disponível
    if (typeof createFilterComponent === 'function') {
      const filterContainer = document.getElementById('filtersContainer');
      if (filterContainer && !filterContainer.innerHTML) {
        filterContainer.innerHTML = createFilterComponent();
      }
    }
    
    // Renderizar jogos organizados por liga
    html += renderGamesByLeague(games, isPremiumUser());
    container.innerHTML = html;
  } else {
    // Fallback para renderização antiga
    container.innerHTML = '';
    const gamesContainer = document.createElement('div');
    gamesContainer.className = 'games-container';

    games.forEach(game => {
      gamesContainer.innerHTML += createGameCard(game);
    });

    container.appendChild(gamesContainer);
  }
}

// Expor renderizacao principal
window.renderGames = renderGames;

// Função para filtrar e renderizar jogos
function filterAndRenderGames(filterState) {
  let filteredGames = [...GAMES];
  
  // Filtrar por país
  if (filterState.country && filterState.country !== 'ALL') {
    const countryMap = {
      'BR': ['Brazil', 'Brasil'],
      'EN': ['England', 'Inglaterra'],
      'ES': ['Spain', 'Espanha'],
      'DE': ['Germany', 'Alemanha'],
      'IT': ['Italy', 'Itália'],
      'FR': ['France', 'França'],
      'EU': ['Europe', 'Europa'],
      'SA': ['South America', 'América do Sul']
    };
    const countries = countryMap[filterState.country] || [filterState.country];
    filteredGames = filteredGames.filter(g => {
      const gameCountry = g.country || g.league?.country || '';
      return countries.some(c => gameCountry.toLowerCase().includes(c.toLowerCase()));
    });
  }
  
  // Filtrar por liga
  if (filterState.league) {
    const leagueId = parseInt(filterState.league);
    filteredGames = filteredGames.filter(g => 
      (g.leagueId || g.league?.id) === leagueId
    );
  }
  
  // Filtrar por busca
  if (filterState.search) {
    const search = filterState.search.toLowerCase();
    filteredGames = filteredGames.filter(g => {
      const homeTeam = (g.homeTeam || g.teams?.home?.name || '').toLowerCase();
      const awayTeam = (g.awayTeam || g.teams?.away?.name || '').toLowerCase();
      const league = (g.competition || g.league?.name || '').toLowerCase();
      return homeTeam.includes(search) || awayTeam.includes(search) || league.includes(search);
    });
  }
  
  // Filtrar por status
  if (filterState.status) {
    filteredGames = filteredGames.filter(g => {
      const status = g.status || g.fixture?.status?.short || '';
      if (filterState.status === 'live') {
        return ['live', '1H', '2H', 'HT', 'LIVE'].includes(status);
      }
      if (filterState.status === 'scheduled') {
        return ['scheduled', 'NS', 'TBD'].includes(status);
      }
      if (filterState.status === 'finished') {
        return ['finished', 'FT', 'AET', 'PEN'].includes(status);
      }
      return true;
    });
  }
  
  // Atualizar GAMES filtrados e renderizar
  const container = document.getElementById('gamesList');
  if (!container) return;
  
  if (filteredGames.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Nenhum jogo encontrado</h3>
        <p>Tente ajustar os filtros</p>
        <button class="btn-reset-filters" onclick="resetFilters()">Limpar Filtros</button>
      </div>
    `;
    return;
  }
  
  if (typeof renderGamesByLeague === 'function') {
    let html = '';
    if (typeof renderLiveGamesSection === 'function' && !filterState.status) {
      html += renderLiveGamesSection(filteredGames);
    }
    html += renderGamesByLeague(filteredGames, isPremiumUser());
    container.innerHTML = html;
  }
}

// Expor para uso global
window.filterAndRenderGames = filterAndRenderGames;
window.GAMES = GAMES;

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
        <button class="btn-analyze" data-action="analisar" data-match-id="${game.id}">
          <span class="btn-icon">✨</span>
          <span class="btn-text">Análise Rápida</span>
        </button>
        ${isPremiumUser() ? `
        <button class="btn-select-game" onclick="toggleGameSelection(${game.id})">
          <span class="btn-icon">+</span>
          <span class="btn-text">Selecionar</span>
        </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Analisar jogo
async function analyzeGame(gameId) {
  const game = GAMES.find(g => g.id === gameId);
  if (!game) return;

  // SITE LIBERADO: sem verificação de limite
  // Premium não tem limite
  // if (!isPremiumUser()) {
  //   // Verificar limite para usuários Free
  //   if (analysisCount >= MAX_FREE_ANALYSIS) {
  //     showPremiumModal();
  //     return;
  //   }
  //   // Incrementar apenas para usuários Free
  //   analysisCount++;
  //   saveAnalysisCount();
  //   updateAnalysisCounter();
  // }

  // Gerar análise
  const analysis = generateAnalysis(game);
  
  // Se for premium, buscar insights de IA real
  if (isPremiumUser()) {
    showAnalysisModal(game, analysis, true); // true = loading AI insights
    await fetchAIInsights(game, analysis);
  } else {
    showAnalysisModal(game, analysis);
  }
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

  // Insights Premium (apenas para usuários premium)
  const premiumInsights = [];
  if (isPremiumUser()) {
    // Insights de Valor
    if (homeWinProb > 55 && game.homeOdds > 2.0) {
      premiumInsights.push(`💡 <strong>Valor detectado:</strong> ${game.homeTeam} tem ${Math.round(homeWinProb)}% de chance mas odds de ${game.homeOdds.toFixed(2)}`);
    }
    if (awayWinProb > 50 && game.awayOdds > 2.5) {
      premiumInsights.push(`💡 <strong>Valor detectado:</strong> ${game.awayTeam} tem ${Math.round(awayWinProb)}% de chance mas odds de ${game.awayOdds.toFixed(2)}`);
    }
    
    // Insights de Forma
    if (homeFormScore > 75) {
      premiumInsights.push(`🔥 <strong>Forma excepcional:</strong> ${game.homeTeam} está invicto em casa nas últimas partidas`);
    }
    if (awayFormScore < 30) {
      premiumInsights.push(`⚠️ <strong>Alerta:</strong> ${game.awayTeam} não vence há várias rodadas`);
    }
    
    // Insights de Mercado
    if (overProb > 65) {
      premiumInsights.push(`⚽ <strong>Recomendação:</strong> Alta probabilidade de Over 2.5 gols (${overProb}%)`);
    }
    if (bttsProb > 65) {
      premiumInsights.push(`🎯 <strong>Oportunidade:</strong> Ambas marcam com ${bttsProb}% de probabilidade`);
    }
    
    // Insights de Confiança
    if (confidence === 'high') {
      premiumInsights.push(`✅ <strong>Aposta segura:</strong> Alta confiança na previsão baseada em múltiplos fatores`);
    }
    
    // Adicionar pelo menos 3 insights se tiver menos
    if (premiumInsights.length < 3) {
      if (Math.abs(homeWinProb - awayWinProb) < 10) {
        premiumInsights.push(`⚖️ <strong>Jogo equilibrado:</strong> Considere mercados alternativos como empate ou gols`);
      }
      if (game.homeOdds < 1.5) {
        premiumInsights.push(`📊 <strong>Favorito claro:</strong> ${game.homeTeam} é o grande favorito das casas de apostas`);
      }
      premiumInsights.push(`💰 <strong>Gestão de banca:</strong> Considere stake de ${confidence === 'high' ? '2-3%' : '1-2%'} da banca total`);
    }
  }

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
    premiumInsights,
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

// Buscar insights de IA da OpenAI (com paywall)
async function fetchAIInsights(game, analysis) {
  try {
    const userId = getUserId();
    
    console.log(`🤖 Buscando insights de IA para match ${game.id}...`);
    
    // Headers com token de autenticação se disponível
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        matchId: game.id,
        userId,
        gameData: game
      })
    });
    
    // Verificar se foi bloqueado pelo paywall (402 Payment Required)
    if (response.status === 402) {
      const data = await response.json();
      console.log('🔒 Paywall ativado:', data.message);
      
      // Fechar modal de análise
      closeAnalysisModal();
      
      // Abrir modal de pagamento
      showPaywallModal(data.message);
      
      return;
    }
    
    if (!response.ok) {
      throw new Error('Erro ao buscar insights');
    }
    
    const data = await response.json();
    
    // Atualizar cache do status do usuário
    if (data.userStatus) {
      userStatusCache = {
        isPremium: data.userStatus.isPremium,
        freeRemaining: data.userStatus.freeRemaining,
        daysRemaining: data.userStatus.daysRemaining
      };
      updateAnalysisCounter();
    }
    
    if (data.success && data.analysis) {
      console.log('✅ Insights de IA recebidos');
      updateModalWithAIInsights(data.analysis);
    } else {
      console.warn('⚠️ Resposta sem insights válidos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar insights de IA:', error);
    // Modal continua com insights locais
  }
}

// Atualizar modal com insights da IA
function updateModalWithAIInsights(insights) {
  const insightsSection = document.querySelector('.premium-insights');
  
  if (!insightsSection) return;
  
  // Limpar insights locais
  insightsSection.innerHTML = '';
  
  // Adicionar summary
  if (insights.summary) {
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'ai-summary';
    summaryDiv.innerHTML = `<strong>📋 Análise Geral:</strong> ${insights.summary}`;
    insightsSection.appendChild(summaryDiv);
  }
  
  // Adicionar picks
  if (insights.picks && insights.picks.length > 0) {
    insights.picks.forEach(pick => {
      const pickDiv = document.createElement('div');
      pickDiv.className = 'insight-item ai-pick';
      
      const confidenceEmoji = pick.confidence >= 75 ? '🟢' : pick.confidence >= 50 ? '🟡' : '🟠';
      
      pickDiv.innerHTML = `
        <strong>${confidenceEmoji} ${pick.market}</strong> (${pick.confidence}% confiança)
        <br><span style="color: var(--text-secondary); font-size: 0.85rem;">${pick.reason}</span>
      `;
      insightsSection.appendChild(pickDiv);
    });
  }
  
  // Adicionar bankroll
  if (insights.bankroll) {
    const bankrollDiv = document.createElement('div');
    bankrollDiv.className = 'insight-item ai-bankroll';
    bankrollDiv.innerHTML = `<strong>💰 Gestão de Banca:</strong> ${insights.bankroll}`;
    insightsSection.appendChild(bankrollDiv);
  }
  
  // Adicionar badge de IA
  const aiBadge = document.createElement('div');
  aiBadge.className = 'ai-powered-badge';
  aiBadge.innerHTML = '🤖 Powered by OpenAI';
  aiBadge.style.cssText = 'text-align: center; margin-top: 12px; font-size: 0.8rem; color: var(--text-muted); opacity: 0.7;';
  insightsSection.appendChild(aiBadge);
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

      ${analysis.premiumInsights && analysis.premiumInsights.length > 0 ? `
        <div class="analysis-section premium-insights-section">
          <h4 class="section-title">🔮 Insights IA Premium</h4>
          <div class="premium-insights">
            ${analysis.premiumInsights.map(insight => `<div class="insight-item">${insight}</div>`).join('')}
          </div>
        </div>
      ` : !analysis.isPremium ? `
        <div class="analysis-section premium-locked-section">
          <h4 class="section-title">🔒 Insights IA Premium</h4>
          <div class="premium-locked">
            <div class="locked-icon">🔮</div>
            <p class="locked-text">Desbloqueie insights avançados de IA</p>
            <ul class="locked-features">
              <li>💡 Análise de valor e odds</li>
              <li>🔥 Tendências e padrões</li>
              <li>⚽ Recomendações de mercado</li>
              <li>💰 Gestão de banca personalizada</li>
            </ul>
            <button class="btn-unlock-premium" onclick="closeAnalysisModal(); activatePremium();">
              💎 Ativar Premium por R$ 4,50
            </button>
          </div>
        </div>
      ` : ''}

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
        <div class="payment-icon">�</div>
        <h2>Assinar Premium</h2>
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
          <span class="price">R$ 3,50</span>
        </div>
      </div>
      
      <div class="payment-info">
        <p>✅ Pagamento via PIX ou Cartão</p>
        <p>✅ Processado pelo Mercado Pago</p>
        <p>✅ Acesso liberado automaticamente</p>
        <p>✅ Válido por 7 dias corridos</p>
      </div>
      
      <button class="btn-confirm-payment" onclick="confirmPayment()">
        💳 Pagar com Mercado Pago - R$ 3,50
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

// =========================================
// ANÁLISE PERSONALIZADA (PREMIUM)
// =========================================
let selectedGames = [];
const MAX_SELECTED_GAMES = 2;

// Toggle seleção de jogo para análise personalizada
function toggleGameSelection(gameId) {
  if (!isPremiumUser()) {
    showPremiumModal();
    return;
  }

  const index = selectedGames.indexOf(gameId);
  
  if (index > -1) {
    // Remover
    selectedGames.splice(index, 1);
  } else {
    // Adicionar (se não exceder limite)
    if (selectedGames.length >= MAX_SELECTED_GAMES) {
      alert(`⚠️ Máximo de ${MAX_SELECTED_GAMES} jogos para análise personalizada`);
      return;
    }
    selectedGames.push(gameId);
  }

  // Atualizar UI
  updateGameSelectionUI();
  updateAnalyzeSelectedButton();
}

// Atualizar UI de seleção
function updateGameSelectionUI() {
  document.querySelectorAll('.game-card').forEach(card => {
    const gameId = parseInt(card.dataset.gameId);
    const isSelected = selectedGames.includes(gameId);
    card.classList.toggle('selected', isSelected);
    
    const selectBtn = card.querySelector('.btn-select-game');
    if (selectBtn) {
      selectBtn.innerHTML = isSelected 
        ? '<span class="btn-icon">✓</span><span class="btn-text">Selecionado</span>'
        : '<span class="btn-icon">+</span><span class="btn-text">Selecionar</span>';
      selectBtn.classList.toggle('selected', isSelected);
    }
  });
}

// Atualizar botão de análise personalizada
function updateAnalyzeSelectedButton() {
  let floatingBtn = document.getElementById('analyzeSelectedBtn');
  
  if (selectedGames.length > 0) {
    if (!floatingBtn) {
      floatingBtn = document.createElement('div');
      floatingBtn.id = 'analyzeSelectedBtn';
      floatingBtn.className = 'floating-analyze-btn';
      document.body.appendChild(floatingBtn);
    }
    floatingBtn.innerHTML = `
      <button onclick="analyzeSelectedGames()">
        <span class="btn-icon">🧠</span>
        <span>Analisar ${selectedGames.length} jogo${selectedGames.length > 1 ? 's' : ''} com IA</span>
      </button>
      <button class="btn-clear" onclick="clearSelection()">✕</button>
    `;
    floatingBtn.classList.add('visible');
  } else {
    if (floatingBtn) {
      floatingBtn.classList.remove('visible');
    }
  }
}

// Limpar seleção
function clearSelection() {
  selectedGames = [];
  updateGameSelectionUI();
  updateAnalyzeSelectedButton();
}

// Analisar jogos selecionados com IA
async function analyzeSelectedGames() {
  if (!isPremiumUser()) {
    showPremiumModal();
    return;
  }

  if (selectedGames.length === 0) {
    alert('Selecione pelo menos 1 jogo para análise');
    return;
  }

  // Mostrar loading
  showAnalysisLoadingModal();

  try {
    // Preparar dados para API
    const fixtures = selectedGames.map(id => {
      const game = GAMES.find(g => g.id === id);
      return {
        fixture_id: game.fixture_id || game.id,
        // Dados extras para fallback local
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        competition: game.competition
      };
    });

    // Chamar API de análise personalizada
    const response = await fetch('/api/ai/analyze-fixtures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fixtures })
    });

    const result = await response.json();

    if (result.success) {
      showPersonalizedAnalysisModal(result.analysis);
    } else {
      throw new Error(result.message || result.error || 'Erro ao gerar análise');
    }

  } catch (error) {
    console.error('Erro na análise:', error);
    closeAnalysisModal();
    alert('❌ Erro ao gerar análise: ' + error.message);
  }

  // Limpar seleção após análise
  clearSelection();
}

// Modal de loading da análise
function showAnalysisLoadingModal() {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.innerHTML = `
    <div class="loading-modal">
      <div class="ai-loading-animation">
        <div class="brain-icon">🧠</div>
        <div class="loading-rings">
          <div class="ring"></div>
          <div class="ring"></div>
          <div class="ring"></div>
        </div>
      </div>
      <h3>Analisando jogos...</h3>
      <p>A IA está processando os dados estatísticos</p>
      <div class="loading-steps">
        <div class="step active">📊 Coletando estatísticas</div>
        <div class="step">⚔️ Analisando confrontos</div>
        <div class="step">🎯 Gerando previsões</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Animar steps
  let currentStep = 0;
  const steps = modal.querySelectorAll('.step');
  const stepInterval = setInterval(() => {
    currentStep++;
    if (currentStep < steps.length) {
      steps[currentStep].classList.add('active');
    } else {
      clearInterval(stepInterval);
    }
  }, 1500);
}

// Modal com análise personalizada
function showPersonalizedAnalysisModal(analyses) {
  closeAnalysisModal();

  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };

  let analysisHTML = '';
  
  Object.keys(analyses).forEach((key, index) => {
    const gameAnalysis = analyses[key];
    analysisHTML += `
      <div class="analysis-game-section">
        <div class="game-header">
          <span class="game-number">${index + 1}</span>
          <div class="game-info">
            <span class="game-match">${gameAnalysis.match}</span>
            <span class="game-league">${gameAnalysis.league}</span>
          </div>
        </div>
        <div class="analysis-content">
          ${formatAnalysisText(gameAnalysis.analysis)}
        </div>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="personalized-analysis-modal">
      <div class="modal-header">
        <div class="header-title">
          <span class="ai-badge">🧠 IA</span>
          <h2>Análise Personalizada</h2>
        </div>
        <button class="btn-close" onclick="closeAnalysisModal()">✕</button>
      </div>
      
      <div class="modal-body">
        ${analysisHTML}
      </div>
      
      <div class="modal-footer">
        <p class="premium-badge-footer">💎 Análise Premium • ${new Date().toLocaleDateString('pt-BR')}</p>
        <button class="btn-close-modal" onclick="closeAnalysisModal()">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Formatar texto de análise
function formatAnalysisText(text) {
  if (!text) return '<p>Análise não disponível</p>';
  
  // Converter markdown simples para HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/^• /gm, '<span class="bullet">•</span> ');
}

// =========================================
// PAYWALL MODAL (NOVO SISTEMA)
// =========================================

function showPaywallModal(message = 'Limite de análises gratuitas atingido') {
  const status = userStatusCache || { isPremium: false, freeRemaining: 0 };
  
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAnalysisModal(); };
  modal.innerHTML = `
    <div class="premium-modal">
      <button class="btn-close" onclick="closePaywallModal()">✕</button>
      <div class="premium-icon">🔒</div>
      <h2 class="premium-title">Limite Atingido</h2>
      <p class="premium-subtitle">${message}</p>
      
      <div class="premium-offer">
        <div class="offer-badge">PAGAMENTO ÚNICO</div>
        <div class="offer-price">
          <span class="price-currency">R$</span>
          <span class="price-value">3,50</span>
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
      
      <button class="btn-premium-cta" onclick="initiatePayment()">
        💎 Pagar R$ 3,50 e Liberar Acesso
      </button>
      
      <p class="premium-note">Pagamento único • Acesso imediato • 7 dias</p>
      
      <div class="premium-divider"></div>
      
      <p class="premium-free-note">Suas análises gratuitas foram usadas. Assine premium para continuar.</p>
    </div>
  `;
  document.body.appendChild(modal);
}

function closePaywallModal() {
  const modal = document.querySelector('.analysis-modal-overlay');
  if (modal) modal.remove();
}

// Função deprecada - agora usa confirmPayment() que redireciona para Mercado Pago
async function initiatePayment() {
  console.warn('⚠️ initiatePayment() deprecado - usando confirmPayment()');
  return confirmPayment();
}

// Função deprecada - Mercado Pago gerencia a interface de pagamento
function showPaymentDetails(payment) {
  console.warn('⚠️ showPaymentDetails() deprecado');
  return null;
}

// Função deprecada - webhook do MP ativa premium automaticamente
function startPaymentVerification() {
  console.warn('⚠️ startPaymentVerification() deprecado');
  return null;
}

// =========================================
// SISTEMA DE AUTENTICAÇÃO (LOGIN/REGISTRO)
// =========================================

let currentUser = null;
let authToken = null;

// Verificar se já está logado ao carregar página
async function checkAuth() {
  const token = localStorage.getItem('metafy_token');
  
  if (token) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        authToken = token;
        updateAuthUI();
        console.log('✅ Já autenticado:', currentUser.email);
        return true;
      } else {
        // Token inválido - limpar
        localStorage.removeItem('metafy_token');
        authToken = null;
        currentUser = null;
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    }
  }
  
  return false;
}

// Atualizar UI com status de autenticação
function updateAuthUI() {
  if (window.USE_FIREBASE_AUTH) return;
  const authButtons = document.querySelector('.auth-buttons');
  if (!authButtons) return;
  
  if (currentUser) {
    authButtons.innerHTML = `
      <div class="user-dropdown">
        <button class="user-btn" onclick="toggleUserDropdown()">
          👤 ${currentUser.name || currentUser.email.split('@')[0]} ▾
        </button>
        <div class="dropdown-menu" id="userDropdownMenu">
          <button class="dropdown-item" onclick="alert('Em breve: Meu Perfil')">
            👤 Meu Perfil
          </button>
          <button class="dropdown-item" onclick="alert('Em breve: Ganhos/Perdas')">
            📊 Ganhos/Perdas
          </button>
          <button class="dropdown-item" onclick="alert('Em breve: Premium')">
            💎 Premium
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout-item" onclick="logout()">
            🚪 Sair
          </button>
        </div>
      </div>
    `;
  } else {
    authButtons.innerHTML = `
      <button class="btn-login" onclick="showLoginModal()">Entrar</button>
      <button class="btn-register" onclick="showRegisterModal()">Criar Conta</button>
    `;
  }
}

// Mostrar modal de login
function showLoginModal() {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay auth-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAuthModal(); };
  modal.innerHTML = `
    <div class="auth-modal">
      <button class="btn-close" onclick="closeAuthModal()">✕</button>
      
      <div class="auth-header">
        <h2>🔐 Entrar</h2>
        <p>Acesse sua conta Metafy</p>
      </div>
      
      <form id="loginForm" onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="loginEmail" required autocomplete="email" />
        </div>
        
        <div class="form-group">
          <label>Senha</label>
          <div class="password-wrap">
            <input type="password" id="loginPassword" required autocomplete="current-password" placeholder="Sua senha" />
            <button type="button" class="toggle-pass" aria-label="Mostrar senha" onclick="togglePassword('loginPassword', this)">
              👁️
            </button>
          </div>
        </div>
        
        <div id="loginError" class="auth-error"></div>
        
        <button type="submit" class="btn-auth-submit">
          <span id="loginButtonText">Entrar</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Não tem conta? <a href="#" onclick="closeAuthModal(); showRegisterModal(); return false;">Criar conta</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Mostrar modal de registro
function showRegisterModal() {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay auth-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeAuthModal(); };
  modal.innerHTML = `
    <div class="auth-modal">
      <button class="btn-close" onclick="closeAuthModal()">✕</button>
      
      <div class="auth-header">
        <h2>✨ Criar Conta</h2>
        <p>Comece com 2 análises grátis!</p>
      </div>
      
      <form id="registerForm" onsubmit="handleRegister(event)">
        <div class="form-group">
          <label>Nome (opcional)</label>
          <input type="text" id="registerName" autocomplete="name" />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="registerEmail" required autocomplete="email" />
        </div>
        
        <div class="form-group">
          <label>Senha (mínimo 6 caracteres)</label>
          <div class="password-wrap">
            <input type="password" id="registerPassword" required autocomplete="new-password" minlength="6" placeholder="Mínimo 6 caracteres" />
            <button type="button" class="toggle-pass" aria-label="Mostrar senha" onclick="togglePassword('registerPassword', this)">
              👁️
            </button>
          </div>
        </div>
        
        <div id="registerError" class="auth-error"></div>
        
        <button type="submit" class="btn-auth-submit">
          <span id="registerButtonText">Criar Conta</span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Já tem conta? <a href="#" onclick="closeAuthModal(); showLoginModal(); return false;">Entrar</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Fechar modal de auth
function closeAuthModal() {
  const modal = document.querySelector('.auth-modal-overlay');
  if (modal) modal.remove();
}

// Handler do formulário de login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  const buttonText = document.getElementById('loginButtonText');
  
  errorDiv.textContent = '';
  buttonText.textContent = 'Entrando...';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      errorDiv.textContent = data.error || 'Erro ao fazer login';
      buttonText.textContent = 'Entrar';
      return;
    }
    
    // Login bem-sucedido
    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem('metafy_token', data.token);
    
    console.log('✅ Login bem-sucedido:', currentUser.email);
    
    closeAuthModal();
    updateAuthUI();
    
    // Atualizar status do usuário
    await fetchUserStatus();
    
    // Mostrar mensagem de sucesso
    alert(`✅ Bem-vindo(a), ${currentUser.name || currentUser.email}!`);
    
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    errorDiv.textContent = 'Erro ao conectar. Tente novamente.';
    buttonText.textContent = 'Entrar';
  }
}

// Handler do formulário de registro
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const errorDiv = document.getElementById('registerError');
  const buttonText = document.getElementById('registerButtonText');
  
  errorDiv.textContent = '';
  buttonText.textContent = 'Criando conta...';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      errorDiv.textContent = data.error || 'Erro ao criar conta';
      buttonText.textContent = 'Criar Conta';
      return;
    }
    
    // Registro bem-sucedido (já faz login automático)
    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem('metafy_token', data.token);
    
    console.log('✅ Conta criada:', currentUser.email);
    
    closeAuthModal();
    updateAuthUI();
    
    // Atualizar status do usuário
    await fetchUserStatus();
    
    // Mostrar mensagem de boas-vindas
    alert(`✅ Conta criada com sucesso!\n\nVocê ganhou 2 análises grátis para começar.`);
    
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    errorDiv.textContent = 'Erro ao conectar. Tente novamente.';
    buttonText.textContent = 'Criar Conta';
  }
}

// Fazer logout
async function logout() {
  if (!confirm('🚪 Deseja realmente sair?')) {
    return;
  }
  
  try {
    if (authToken) {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).catch(err => console.log('Erro ao notificar backend:', err));
    }
    
    // Limpar todas as variáveis
    currentUser = null;
    authToken = null;
    
    // Limpar todo localStorage relacionado ao Metafy
    localStorage.removeItem('metafy_token');
    localStorage.removeItem('metafy_user_id');
    localStorage.removeItem('metafy_premium');
    localStorage.removeItem('metafy_premium_user');
    
    alert('✅ Logout realizado com sucesso!');
    
    // Recarregar página para resetar estado
    window.location.reload();
    
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    // Mesmo com erro, limpar dados locais
    currentUser = null;
    authToken = null;
    localStorage.clear();
    window.location.reload();
  }
}

// Expor funções globais
window.analyzeGame = analyzeGame;
window.closeAnalysisModal = closeAnalysisModal;
window.closePaywallModal = closePaywallModal;
window.showPaywallModal = showPaywallModal;
window.initiatePayment = initiatePayment;
window.activatePremium = activatePremium;
window.confirmPayment = confirmPayment;
window.isPremiumUser = isPremiumUser;
window.getPremiumData = getPremiumData;
window.showPaymentModal = showPaymentModal;
window.toggleGameSelection = toggleGameSelection;
window.analyzeSelectedGames = analyzeSelectedGames;
// Toggle mostrar/ocultar senha
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁️';
  btn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
}

// Toggle dropdown do usuário
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdownMenu');
  if (!dropdown) return;
  
  dropdown.classList.toggle('show');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('userDropdownMenu');
  const userBtn = document.querySelector('.user-btn');
  
  if (dropdown && !dropdown.contains(e.target) && e.target !== userBtn) {
    dropdown.classList.remove('show');
  }
});

window.clearSelection = clearSelection;
window.logout = logout;
window.togglePassword = togglePassword;
window.toggleUserDropdown = toggleUserDropdown;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeAuthModal = closeAuthModal;
window.closePixModal = closePixModal;
window.resetPixModal = resetPixModal;
window.copyPixCode = copyPixCode;
window.generatePixPayment = generatePixPayment;
// Autenticação
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeAuthModal = closeAuthModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
