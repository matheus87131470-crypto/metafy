// =====================================================
// src/ui/LeagueFilter.js
// Componentes de filtro por País → Liga → Campeonato
// =====================================================

/**
 * Configuração de ligas prioritárias (espelhado do config)
 */
const PRIORITY_LEAGUES = [
  // Brasil
  { id: 71, name: 'Brasileirão Série A', country: 'Brazil', flag: '🇧🇷' },
  { id: 72, name: 'Brasileirão Série B', country: 'Brazil', flag: '🇧🇷' },
  { id: 73, name: 'Copa do Brasil', country: 'Brazil', flag: '🇧🇷' },
  
  // Inglaterra
  { id: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 45, name: 'FA Cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  
  // Espanha
  { id: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: 143, name: 'Copa del Rey', country: 'Spain', flag: '🇪🇸' },
  
  // Alemanha
  { id: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  
  // Itália
  { id: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  
  // França
  { id: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
  
  // Europa
  { id: 2, name: 'Champions League', country: 'Europe', flag: '🏆' },
  { id: 3, name: 'Europa League', country: 'Europe', flag: '🏆' },
  { id: 848, name: 'Conference League', country: 'Europe', flag: '🏆' },
  
  // América do Sul
  { id: 13, name: 'Libertadores', country: 'South America', flag: '🌎' },
  { id: 11, name: 'Sul-Americana', country: 'South America', flag: '🌎' }
];

/**
 * Países prioritários
 */
const PRIORITY_COUNTRIES = [
  { code: 'ALL', name: 'Todos', flag: '🌍' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'EN', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'EU', name: 'Europa', flag: '🇪🇺' },
  { code: 'SA', name: 'América do Sul', flag: '🌎' }
];

/**
 * Estado dos filtros
 */
let filterState = {
  country: 'ALL',
  league: null,
  search: ''
};

/**
 * Cria o componente completo de filtros
 */
function createFilterComponent() {
  return `
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <span class="filter-icon">🎯</span>
          Filtrar Jogos
        </h3>
        <button class="filter-reset-btn" onclick="resetFilters()" title="Limpar filtros">
          ↺
        </button>
      </div>

      <!-- Barra de busca -->
      <div class="filter-search">
        <input 
          type="text" 
          id="searchInput" 
          class="search-input" 
          placeholder="Buscar time ou liga..."
          oninput="handleSearch(this.value)"
        />
        <span class="search-icon">🔍</span>
      </div>

      <!-- Filtro de País (Pills) -->
      <div class="country-filter">
        <div class="country-pills" id="countryPills">
          ${PRIORITY_COUNTRIES.map(c => `
            <button 
              class="country-pill ${filterState.country === c.code ? 'active' : ''}"
              data-country="${c.code}"
              onclick="selectCountry('${c.code}')"
            >
              <span class="pill-flag">${c.flag}</span>
              <span class="pill-name">${c.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Filtro de Liga (Dropdown) -->
      <div class="league-filter">
        <select id="leagueSelect" class="league-select" onchange="selectLeague(this.value)">
          <option value="">Todas as Ligas</option>
          ${createLeagueOptions()}
        </select>
      </div>

      <!-- Filtros rápidos -->
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="filterByStatus('live')">
          <span class="qf-icon">🔴</span>
          <span class="qf-text">Ao Vivo</span>
        </button>
        <button class="quick-filter-btn" onclick="filterByStatus('scheduled')">
          <span class="qf-icon">⏰</span>
          <span class="qf-text">Próximos</span>
        </button>
        <button class="quick-filter-btn" onclick="filterByStatus('finished')">
          <span class="qf-icon">✓</span>
          <span class="qf-text">Finalizados</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Cria opções de liga agrupadas por país
 */
function createLeagueOptions() {
  const grouped = {};
  
  PRIORITY_LEAGUES.forEach(league => {
    const country = league.country;
    if (!grouped[country]) {
      grouped[country] = [];
    }
    grouped[country].push(league);
  });
  
  let html = '';
  Object.entries(grouped).forEach(([country, leagues]) => {
    const countryInfo = PRIORITY_COUNTRIES.find(c => 
      c.name === country || 
      (country === 'Brazil' && c.code === 'BR') ||
      (country === 'England' && c.code === 'EN') ||
      (country === 'Spain' && c.code === 'ES') ||
      (country === 'Germany' && c.code === 'DE') ||
      (country === 'Italy' && c.code === 'IT') ||
      (country === 'France' && c.code === 'FR') ||
      (country === 'Europe' && c.code === 'EU') ||
      (country === 'South America' && c.code === 'SA')
    );
    
    html += `<optgroup label="${countryInfo?.flag || '🏳️'} ${country}">`;
    leagues.forEach(league => {
      html += `<option value="${league.id}">${league.name}</option>`;
    });
    html += `</optgroup>`;
  });
  
  return html;
}

/**
 * Seleciona país
 */
function selectCountry(countryCode) {
  filterState.country = countryCode;
  filterState.league = null;
  
  // Atualizar UI
  document.querySelectorAll('.country-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.country === countryCode);
  });
  
  // Atualizar opções de liga
  updateLeagueSelect();
  
  // Filtrar jogos
  applyFilters();
}

/**
 * Seleciona liga
 */
function selectLeague(leagueId) {
  filterState.league = leagueId || null;
  applyFilters();
}

/**
 * Busca
 */
function handleSearch(value) {
  filterState.search = value.toLowerCase();
  applyFilters();
}

/**
 * Filtrar por status
 */
function filterByStatus(status) {
  // Toggle: se já está ativo, remove
  if (filterState.status === status) {
    filterState.status = null;
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  } else {
    filterState.status = status;
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase().includes(
        status === 'live' ? 'vivo' : status === 'scheduled' ? 'próximos' : 'finalizados'
      ));
    });
  }
  applyFilters();
}

/**
 * Reset filtros
 */
function resetFilters() {
  filterState = {
    country: 'ALL',
    league: null,
    search: '',
    status: null
  };
  
  // Reset UI
  document.querySelectorAll('.country-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.country === 'ALL');
  });
  
  const leagueSelect = document.getElementById('leagueSelect');
  if (leagueSelect) leagueSelect.value = '';
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  applyFilters();
}

/**
 * Atualiza select de ligas baseado no país
 */
function updateLeagueSelect() {
  const select = document.getElementById('leagueSelect');
  if (!select) return;
  
  let filteredLeagues = PRIORITY_LEAGUES;
  
  if (filterState.country !== 'ALL') {
    const countryMap = {
      'BR': 'Brazil',
      'EN': 'England',
      'ES': 'Spain',
      'DE': 'Germany',
      'IT': 'Italy',
      'FR': 'France',
      'EU': 'Europe',
      'SA': 'South America'
    };
    const countryName = countryMap[filterState.country];
    filteredLeagues = PRIORITY_LEAGUES.filter(l => l.country === countryName);
  }
  
  select.innerHTML = `
    <option value="">Todas as Ligas</option>
    ${filteredLeagues.map(l => `
      <option value="${l.id}">${l.flag} ${l.name}</option>
    `).join('')}
  `;
}

/**
 * Aplica filtros e atualiza a lista
 */
function applyFilters() {
  // Esta função será chamada do app.js principal
  if (typeof window.filterAndRenderGames === 'function') {
    window.filterAndRenderGames(filterState);
  }
}

/**
 * Retorna estado atual dos filtros
 */
function getFilterState() {
  return filterState;
}

// Exportar para uso global
window.createFilterComponent = createFilterComponent;
window.selectCountry = selectCountry;
window.selectLeague = selectLeague;
window.handleSearch = handleSearch;
window.filterByStatus = filterByStatus;
window.resetFilters = resetFilters;
window.getFilterState = getFilterState;
