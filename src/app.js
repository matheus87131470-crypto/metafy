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

// Ativar Premium (pagamento PIX via Mercado Pago)
const BACKEND_URL = 'https://metafy-8qk7.onrender.com';
let paymentCheckInterval = null;

// Gerar ou recuperar userId único baseado no email
function getOrCreateUserId(email) {
  // Tentar recuperar userId existente
  let userId = localStorage.getItem('metafy_user_id');
  
  if (!userId && email) {
    // Criar userId simples baseado no email
    userId = 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    localStorage.setItem('metafy_user_id', userId);
  }
  
  return userId || 'guest_' + Date.now();
}

function getCurrentUserId() {
  return localStorage.getItem('metafy_user_id') || null;
}

function activatePremium() {
  openPixModal();
}

function openPixModal() {
  const modal = document.getElementById('pixPaymentModal');
  const form = document.getElementById('pixForm');
  const loading = document.getElementById('pixLoading');
  const content = document.getElementById('pixContent');
  const error = document.getElementById('pixError');
  
  // Mostrar modal com formulário
  modal.style.display = 'flex';
  form.style.display = 'block';
  loading.style.display = 'none';
  content.style.display = 'none';
  error.style.display = 'none';
  
  // Limpar inputs
  document.getElementById('emailInput').value = '';
  document.getElementById('cpfInput').value = '';
  document.getElementById('emailError').style.display = 'none';
  document.getElementById('cpfError').style.display = 'none';
}

function validateCPF(cpf) {
  // Remove tudo que não é número
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11;
}

function validateEmail(email) {
  // Validação simples de email
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function formatCPF(value) {
  // Remove tudo que não é número
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

// Auto-formatar CPF ao digitar
document.addEventListener('DOMContentLoaded', () => {
  const cpfInput = document.getElementById('cpfInput');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      e.target.value = formatCPF(e.target.value);
    });
  }
});

async function generatePixPayment() {
  const emailInput = document.getElementById('emailInput');
  const cpfInput = document.getElementById('cpfInput');
  const emailError = document.getElementById('emailError');
  const cpfError = document.getElementById('cpfError');
  const emailValue = emailInput.value.trim();
  const cpfValue = cpfInput.value;
  
  let hasError = false;
  
  // Validar Email
  if (!validateEmail(emailValue)) {
    emailError.style.display = 'block';
    emailError.textContent = 'Email inválido';
    emailInput.focus();
    hasError = true;
  } else {
    emailError.style.display = 'none';
  }
  
  // Validar CPF
  if (!validateCPF(cpfValue)) {
    cpfError.style.display = 'block';
    cpfError.textContent = 'CPF deve ter 11 dígitos válidos';
    if (!hasError) cpfInput.focus();
    hasError = true;
  } else {
    cpfError.style.display = 'none';
  }
  
  if (hasError) return;
  
  // Gerar userId baseado no email
  const userId = getOrCreateUserId(emailValue);
  
  // Extrair apenas números do CPF
  const cpf = cpfValue.replace(/\D/g, '');
  
  // Mostrar loading
  const form = document.getElementById('pixForm');
  const loading = document.getElementById('pixLoading');
  const content = document.getElementById('pixContent');
  const error = document.getElementById('pixError');
  
  form.style.display = 'none';
  loading.style.display = 'block';
  content.style.display = 'none';
  error.style.display = 'none';
  
  const requestUrl = `${BACKEND_URL}/api/payments/pix`;
  const requestBody = {
    userId: userId,
    email: emailValue,
    cpf: cpf,
    amount: PREMIUM_PRICE
  };
  
  console.log('📤 Iniciando requisição PIX:');
  console.log('URL:', requestUrl);
  console.log('Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    // Chamar API para criar pagamento PIX
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Resposta recebida:');
    console.log('Status:', response.status, response.statusText);
    console.log('URL:', response.url);
    
    if (!response.ok) {
      // Ler texto da resposta para mostrar erro real
      const errorText = await response.text();
      console.error('❌ Erro do servidor:', errorText);
      
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      // Tentar parsear JSON se possível
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Se não é JSON, usar texto direto (limitado)
        if (errorText && errorText.length < 200) {
          errorMessage += ` - ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ Resposta parseada:', data);
    
    if (data.success && data.qr_code_base64 && data.qr_code) {
      // Atualizar modal com QR Code
      document.getElementById('qrCodeImage').src = data.qr_code_base64;
      document.getElementById('pixCode').value = data.qr_code;
      
      // Salvar paymentId para verificação
      sessionStorage.setItem('currentPaymentId', data.payment_id);
      console.log('💳 Payment ID salvo:', data.payment_id);
      
      // Mostrar conteúdo
      loading.style.display = 'none';
      content.style.display = 'block';
      
      // Iniciar verificação automática
      startPaymentCheck();
    } else {
      console.error('❌ Resposta inválida:', data);
      throw new Error(data.error || 'Resposta inválida do servidor');
    }
  } catch (err) {
    console.error('🔴 ERRO AO GERAR PIX:');
    console.error('Tipo:', err.name);
    console.error('Mensagem:', err.message);
    console.error('Stack:', err.stack);
    
    loading.style.display = 'none';
    error.style.display = 'block';
    document.getElementById('errorMessage').textContent = err.message || 'Erro ao gerar pagamento. Tente novamente.';
  }
}

function closePixModal() {
  const modal = document.getElementById('pixPaymentModal');
  modal.style.display = 'none';
  
  // Parar verificação
  if (paymentCheckInterval) {
    clearInterval(paymentCheckInterval);
    paymentCheckInterval = null;
  }
}

function resetPixModal() {
  // Volta para o formulário inicial
  const form = document.getElementById('pixForm');
  const loading = document.getElementById('pixLoading');
  const content = document.getElementById('pixContent');
  const error = document.getElementById('pixError');
  
  form.style.display = 'block';
  loading.style.display = 'none';
  content.style.display = 'none';
  error.style.display = 'none';
  
  // Limpar campos
  document.getElementById('emailInput').value = '';
  document.getElementById('cpfInput').value = '';
  document.getElementById('emailError').style.display = 'none';
  document.getElementById('cpfError').style.display = 'none';
}


function copyPixCode() {
  const pixCodeInput = document.getElementById('pixCode');
  pixCodeInput.select();
  
  navigator.clipboard.writeText(pixCodeInput.value).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    
    btn.textContent = '✅ Copiado!';
    btn.style.background = 'var(--accent-green)';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    alert('❌ Erro ao copiar código');
  });
}

function startPaymentCheck() {
  // Pegar userId atual
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('❌ userId não encontrado');
    return;
  }
  
  // Verificar a cada 5 segundos
  paymentCheckInterval = setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/${userId}`);
      const data = await response.json();
      
      if (data.success && data.isPremium) {
        // Premium ativado!
        clearInterval(paymentCheckInterval);
        paymentCheckInterval = null;
        
        // Salvar no localStorage
        const now = new Date();
        const premiumEnd = new Date(data.user.premiumEnd || now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const premiumData = {
          premium_start: data.user.premiumSince || now.toISOString(),
          premium_end: premiumEnd.toISOString(),
          price_paid: PREMIUM_PRICE,
          payment_date: now.toISOString(),
          user_id: userId
        };
        
        localStorage.setItem('metafy_premium', JSON.stringify(premiumData));
        localStorage.setItem('metafy_premium_user', 'true');
        
        // Mostrar tela de sucesso
        document.getElementById('pixContent').style.display = 'none';
        document.getElementById('pixSuccess').style.display = 'block';
        
        // Atualizar UI
        updatePremiumUI();
      }
    } catch (err) {
      console.error('Erro ao verificar premium:', err);
    }
  }, 5000); // 5 segundos
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
  container.innerHTML = createLoader('Carregando jogos reais...');

  try {
    // Usar API real do backend (SportAPI7)
    console.log('🔄 Buscando partidas de hoje via SportAPI7...');
    const response = await fetch(`${BACKEND_URL}/api/matches/today`);
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
      throw new Error('Nenhuma partida encontrada');
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
      html += renderLiveGamesSection(GAMES);
    }
    
    // Renderizar filtros se disponível
    if (typeof createFilterComponent === 'function') {
      const filterContainer = document.getElementById('filtersContainer');
      if (filterContainer && !filterContainer.innerHTML) {
        filterContainer.innerHTML = createFilterComponent();
      }
    }
    
    // Renderizar jogos organizados por liga
    html += renderGamesByLeague(GAMES, isPremiumUser());
    container.innerHTML = html;
  } else {
    // Fallback para renderização antiga
    container.innerHTML = '';
    const gamesContainer = document.createElement('div');
    gamesContainer.className = 'games-container';

    GAMES.forEach(game => {
      gamesContainer.innerHTML += createGameCard(game);
    });

    container.appendChild(gamesContainer);
  }
}

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
        <button class="btn-analyze" onclick="analyzeGame(${game.id})">
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

// Buscar insights de IA da OpenAI
async function fetchAIInsights(game, analysis) {
  try {
    const userId = getCurrentUserId();
    
    console.log(`🤖 Buscando insights de IA para match ${game.id}...`);
    
    const response = await fetch(`${BACKEND_URL}/api/insights-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        matchId: game.id,
        userId 
      })
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar insights');
    }
    
    const data = await response.json();
    
    if (data.success && data.insights) {
      console.log('✅ Insights de IA recebidos:', data.source);
      updateModalWithAIInsights(data.insights);
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

// Expor funções globais
window.analyzeGame = analyzeGame;
window.closeAnalysisModal = closeAnalysisModal;
window.activatePremium = activatePremium;
window.confirmPayment = confirmPayment;
window.isPremiumUser = isPremiumUser;
window.getPremiumData = getPremiumData;
window.showPaymentModal = showPaymentModal;
window.toggleGameSelection = toggleGameSelection;
window.analyzeSelectedGames = analyzeSelectedGames;
window.clearSelection = clearSelection;
window.closePixModal = closePixModal;
window.resetPixModal = resetPixModal;
window.copyPixCode = copyPixCode;
window.generatePixPayment = generatePixPayment;
