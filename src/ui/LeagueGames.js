// =====================================================
// src/ui/LeagueGames.js
// Componente para exibir jogos organizados por liga
// =====================================================

/**
 * Agrupa jogos por liga
 */
function groupGamesByLeague(games) {
  const grouped = {};
  
  games.forEach(game => {
    const leagueId = game.leagueId || game.league?.id || game.competition;
    const leagueName = game.league?.name || game.competition || 'Outros';
    
    if (!grouped[leagueId]) {
      grouped[leagueId] = {
        id: leagueId,
        name: leagueName,
        country: game.league?.country || game.country || '',
        logo: game.league?.logo || game.competitionLogo || '⚽',
        flag: getCountryFlag(game.league?.country || game.country),
        games: []
      };
    }
    
    grouped[leagueId].games.push(game);
  });
  
  // Ordenar por prioridade das ligas
  return Object.values(grouped).sort((a, b) => {
    const priorityA = getLeaguePriority(a.id);
    const priorityB = getLeaguePriority(b.id);
    return priorityA - priorityB;
  });
}

/**
 * Prioridade das ligas
 */
function getLeaguePriority(leagueId) {
  const priorities = {
    71: 1,   // Brasileirão A
    72: 2,   // Brasileirão B
    39: 3,   // Premier League
    140: 4,  // La Liga
    78: 5,   // Bundesliga
    135: 6,  // Serie A
    61: 7,   // Ligue 1
    2: 8,    // UCL
    3: 9,    // UEL
    13: 10,  // Libertadores
  };
  return priorities[leagueId] || 99;
}

/**
 * Bandeira do país
 */
function getCountryFlag(country) {
  const flags = {
    'Brazil': '🇧🇷',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'Portugal': '🇵🇹',
    'Netherlands': '🇳🇱',
    'Europe': '🇪🇺',
    'World': '🌍'
  };
  return flags[country] || '🏳️';
}

/**
 * Renderiza jogos agrupados por liga
 */
function renderGamesByLeague(games, isPremium = false) {
  if (!games || games.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">⚽</div>
        <h3>Nenhum jogo encontrado</h3>
        <p>Tente ajustar os filtros ou volte mais tarde</p>
      </div>
    `;
  }
  
  const groupedLeagues = groupGamesByLeague(games);
  
  let html = '<div class="leagues-container">';
  
  groupedLeagues.forEach(league => {
    html += `
      <div class="league-section" data-league-id="${league.id}">
        <div class="league-header">
          <div class="league-info">
            <span class="league-logo">${league.logo}</span>
            <span class="league-name">${league.name}</span>
            <span class="league-country">${league.flag}</span>
          </div>
          <span class="league-count">${league.games.length} jogo${league.games.length > 1 ? 's' : ''}</span>
        </div>
        
        <div class="league-games">
          ${league.games.map(game => createGameCardCompact(game, isPremium)).join('')}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  return html;
}

/**
 * Cria card de jogo compacto
 */
function createGameCardCompact(game, isPremium = false) {
  const gameId = game.id || game.fixture?.id;
  const isSelected = window.selectedGames?.includes(gameId);
  
  const status = getGameStatus(game);
  const statusClass = status.class;
  const statusText = status.text;
  
  const homeTeam = game.homeTeam || game.teams?.home?.name;
  const awayTeam = game.awayTeam || game.teams?.away?.name;
  const homeScore = game.homeScore ?? game.goals?.home;
  const awayScore = game.awayScore ?? game.goals?.away;
  const homeOdds = game.homeOdds || 0;
  const drawOdds = game.drawOdds || 0;
  const awayOdds = game.awayOdds || 0;
  
  const time = game.time || formatGameTime(game.date || game.fixture?.date);
  
  return `
    <div class="game-card-wrapper" data-game-wrapper-id="${gameId}">
      <div class="game-card-compact ${isSelected ? 'selected' : ''}" data-game-id="${gameId}">
        <div class="game-time-status">
          <span class="game-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="game-teams">
          <div class="team-row">
            <div class="team-logo">
              ${game.teams?.home?.logo ? `<img src="${game.teams.home.logo}" alt="" />` : '🏠'}
            </div>
            <span class="team-name">${homeTeam}</span>
            <span class="team-score">${homeScore !== null && homeScore !== undefined ? homeScore : '-'}</span>
          </div>
          
          <div class="team-row">
            <div class="team-logo">
              ${game.teams?.away?.logo ? `<img src="${game.teams.away.logo}" alt="" />` : '✈️'}
            </div>
            <span class="team-name">${awayTeam}</span>
            <span class="team-score">${awayScore !== null && awayScore !== undefined ? awayScore : '-'}</span>
          </div>
        </div>
        
        ${homeOdds > 0 ? `
        <div class="game-odds">
          <span class="odd ${homeOdds < awayOdds ? 'favorite' : ''}">${homeOdds.toFixed(2)}</span>
          <span class="odd">${drawOdds.toFixed(2)}</span>
          <span class="odd ${awayOdds < homeOdds ? 'favorite' : ''}">${awayOdds.toFixed(2)}</span>
        </div>
        ` : ''}
        
        <div class="game-actions">
          <button class="btn-analyze-compact" onclick="togglePredictionBlock(${gameId})" title="Ver previsao">
            ✨
          </button>
          ${isPremium ? `
          <button class="btn-select-compact ${isSelected ? 'selected' : ''}" 
                  onclick="toggleGameSelection(${gameId})" 
                  title="${isSelected ? 'Remover seleção' : 'Selecionar para análise combinada'}">
            ${isSelected ? '✓' : '+'}
          </button>
          ` : ''}
        </div>
      </div>

      <div class="prediction-container" data-prediction-for="${gameId}"></div>
    </div>
  `;
}

/**
 * Dados de previsao (mock) baseados em odds
 */
function getPredictionData(game) {
  const homeOdds = Number(game.homeOdds) || 2.6;
  const drawOdds = Number(game.drawOdds) || 3.2;
  const awayOdds = Number(game.awayOdds) || 2.9;

  const homeProb = 1 / homeOdds;
  const drawProb = 1 / drawOdds;
  const awayProb = 1 / awayOdds;
  const total = homeProb + drawProb + awayProb;

  const homePct = (homeProb / total) * 100;
  const drawPct = (drawProb / total) * 100;
  const awayPct = (awayProb / total) * 100;

  const avgOdds = (homeOdds + drawOdds + awayOdds) / 3;

  let pickLabel = 'Under 3.5';
  if (avgOdds < 2.5) pickLabel = 'Under 2.5';
  if (avgOdds > 3.2) pickLabel = 'Over 2.5';

  let confidencePct = Math.max(homePct, drawPct, awayPct) + 10;
  confidencePct = Math.min(98, Math.max(65, confidencePct));

  let confidenceLabel = 'MEDIA CONFIANCA';
  let level = 'medium';
  if (confidencePct >= 85) {
    confidenceLabel = 'ALTA CONFIANCA';
    level = 'high';
  } else if (confidencePct < 75) {
    confidenceLabel = 'BAIXA CONFIANCA';
    level = 'low';
  }

  const bttsPct = Math.min(82, Math.max(45, 100 - avgOdds * 12));
  const over15Pct = Math.min(88, Math.max(60, 120 - avgOdds * 15));
  const over25Pct = Math.min(80, Math.max(50, 110 - avgOdds * 17));

  return {
    confidencePct: confidencePct.toFixed(1),
    confidenceLabel,
    marketLabel: 'GOLS: ACIMA/ABAIXO',
    pickLabel,
    level,
    other: [
      { label: 'Ambas Marcam', pct: bttsPct.toFixed(1) },
      { label: 'Over 1.5 Gols', pct: over15Pct.toFixed(1) },
      { label: 'Over 2.5 Gols', pct: over25Pct.toFixed(1) }
    ]
  };
}

/**
 * Renderiza o bloco de previsao expandivel
 */
function renderPredictionBlock(game) {
  const data = getPredictionData(game);
  const otherHtml = data.other && data.other.length > 0
    ? `
      <div class="other-probabilities">
        <div class="other-probabilities-header" onclick="toggleOtherPredictions(${game.id || game.fixture?.id})">
          <span>Outras Probabilidades</span>
          <span class="other-toggle">▾</span>
        </div>
        <div class="other-probabilities-list">
          ${data.other.map(item => `
            <div class="other-probability-item">
              <span>${item.label}</span>
              <span>${item.pct}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <div class="prediction-block-compact ${data.level}">
      <div class="prediction-main">
        <div class="prediction-info">
          <div class="prediction-market">${data.marketLabel}</div>
          <div class="prediction-pick">${data.pickLabel}</div>
        </div>
        <div class="prediction-badge ${data.level}">
          <div class="prediction-pct">${data.confidencePct}%</div>
          <div class="prediction-label">${data.confidenceLabel}</div>
        </div>
      </div>

      <div class="prediction-actions">
        <button class="btn-prediction-stats" onclick="analyzeGame(${game.id || game.fixture?.id})">Analisar Stats</button>
        <button class="btn-prediction-ai" onclick="analyzeGame(${game.id || game.fixture?.id})">Analisar com IA</button>
      </div>

      ${otherHtml}
    </div>
  `;
}

/**
 * Toggle do bloco de previsao
 */
function togglePredictionBlock(gameId) {
  const container = document.querySelector(`[data-prediction-for="${gameId}"]`);
  if (!container) return;

  if (container.dataset.expanded === 'true') {
    container.innerHTML = '';
    container.dataset.expanded = 'false';
    return;
  }

  const allGames = (typeof GAMES !== 'undefined' ? GAMES : []).concat(typeof LIVE_GAMES !== 'undefined' ? LIVE_GAMES : []);
  const game = allGames.find(g => (g.id || g.fixture?.id) === gameId);
  if (!game) return;

  container.innerHTML = renderPredictionBlock(game);
  container.dataset.expanded = 'true';
}

/**
 * Toggle da lista de outras probabilidades
 */
function toggleOtherPredictions(gameId) {
  const wrapper = document.querySelector(`[data-prediction-for="${gameId}"]`);
  if (!wrapper) return;

  const list = wrapper.querySelector('.other-probabilities-list');
  const toggle = wrapper.querySelector('.other-toggle');
  if (!list || !toggle) return;

  list.classList.toggle('expanded');
  toggle.classList.toggle('expanded');
}

/**
 * Obtém status do jogo
 */
function getGameStatus(game) {
  const status = game.status || game.fixture?.status?.short;
  
  if (status === 'live' || status === '1H' || status === '2H' || status === 'HT' || status === 'LIVE') {
    const minute = game.minute || game.fixture?.status?.elapsed;
    return {
      class: 'status-live',
      text: `🔴 ${minute ? minute + "'" : 'AO VIVO'}`
    };
  }
  
  if (status === 'finished' || status === 'FT' || status === 'AET' || status === 'PEN') {
    return {
      class: 'status-finished',
      text: '✓ FIM'
    };
  }
  
  const time = game.time || formatGameTime(game.date || game.fixture?.date);
  return {
    class: 'status-scheduled',
    text: `⏰ ${time}`
  };
}

/**
 * Formata horário do jogo
 */
function formatGameTime(dateString) {
  if (!dateString) return '--:--';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Renderiza seção de jogos ao vivo em destaque
 */
function renderLiveGamesSection(games) {
  const liveGames = games.filter(g => {
    const status = g.status || g.fixture?.status?.short;
    return status === 'live' || status === '1H' || status === '2H' || status === 'HT' || status === 'LIVE';
  });
  
  if (liveGames.length === 0) return '';
  
  return `
    <div class="live-games-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="live-dot"></span>
          Jogos ao Vivo
        </h3>
        <span class="live-count">${liveGames.length} jogo${liveGames.length > 1 ? 's' : ''}</span>
      </div>
      
      <div class="live-games-carousel">
        ${liveGames.map(game => createLiveGameCard(game)).join('')}
      </div>
    </div>
  `;
}

/**
 * Card de jogo ao vivo (destaque)
 */
function createLiveGameCard(game) {
  const gameId = game.id || game.fixture?.id;
  const homeTeam = game.homeTeam || game.teams?.home?.name;
  const awayTeam = game.awayTeam || game.teams?.away?.name;
  const homeScore = game.homeScore ?? game.goals?.home ?? 0;
  const awayScore = game.awayScore ?? game.goals?.away ?? 0;
  const minute = game.minute || game.fixture?.status?.elapsed || 0;
  const league = game.league?.name || game.competition || '';
  
  return `
    <div class="live-game-card" data-game-id="${gameId}">
      <div class="live-badge">
        <span class="live-dot"></span>
        <span class="live-minute">${minute}'</span>
      </div>
      
      <div class="live-league">${league}</div>
      
      <div class="live-match">
        <div class="live-team ${homeScore > awayScore ? 'winning' : ''}">
          <span class="team-name">${homeTeam}</span>
          <span class="team-score">${homeScore}</span>
        </div>
        
        <div class="live-team ${awayScore > homeScore ? 'winning' : ''}">
          <span class="team-name">${awayTeam}</span>
          <span class="team-score">${awayScore}</span>
        </div>
      </div>
      
      <button class="btn-analyze-live" onclick="analyzeGame(${gameId})">
        Análise ao Vivo ✨
      </button>
    </div>
  `;
}

// Exportar para uso global
window.renderGamesByLeague = renderGamesByLeague;
window.renderLiveGamesSection = renderLiveGamesSection;
window.groupGamesByLeague = groupGamesByLeague;
window.togglePredictionBlock = togglePredictionBlock;
window.toggleOtherPredictions = toggleOtherPredictions;
