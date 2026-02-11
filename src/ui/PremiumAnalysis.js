// =====================================================
// src/ui/PremiumAnalysis.js
// Área Premium para análise combinada de 2 jogos
// =====================================================

/**
 * Estado de seleção de jogos
 */
window.selectedGames = [];
const MAX_SELECTION = 2;

/**
 * Toggle seleção de jogo
 */
function toggleGameSelection(gameId) {
  if (!window.isPremiumUser || !window.isPremiumUser()) {
    showPremiumModal();
    return;
  }
  
  const index = window.selectedGames.indexOf(gameId);
  
  if (index > -1) {
    // Remover
    window.selectedGames.splice(index, 1);
  } else {
    // Adicionar (max 2)
    if (window.selectedGames.length >= MAX_SELECTION) {
      showNotification('Máximo de 2 jogos selecionados. Remova um para adicionar outro.', 'warning');
      return;
    }
    window.selectedGames.push(gameId);
  }
  
  // Atualizar UI
  updateSelectionUI();
  updateFloatingButton();
}

/**
 * Atualiza UI de seleção
 */
function updateSelectionUI() {
  document.querySelectorAll('.game-card-compact, .game-card').forEach(card => {
    const gameId = parseInt(card.dataset.gameId);
    const isSelected = window.selectedGames.includes(gameId);
    
    card.classList.toggle('selected', isSelected);
    
    const selectBtn = card.querySelector('.btn-select-compact, .btn-select-game');
    if (selectBtn) {
      selectBtn.classList.toggle('selected', isSelected);
      selectBtn.innerHTML = isSelected ? 
        '<span class="btn-icon">✓</span><span class="btn-text">Selecionado</span>' :
        '<span class="btn-icon">+</span><span class="btn-text">Selecionar</span>';
    }
  });
}

/**
 * Atualiza botão flutuante
 */
function updateFloatingButton() {
  let floatingBtn = document.getElementById('floatingAnalyzeBtn');
  
  if (window.selectedGames.length === 0) {
    if (floatingBtn) floatingBtn.remove();
    return;
  }
  
  if (!floatingBtn) {
    floatingBtn = document.createElement('div');
    floatingBtn.id = 'floatingAnalyzeBtn';
    floatingBtn.className = 'floating-analyze-container';
    document.body.appendChild(floatingBtn);
  }
  
  const games = window.selectedGames.map(id => 
    window.GAMES?.find(g => (g.id || g.fixture?.id) === id)
  ).filter(Boolean);
  
  floatingBtn.innerHTML = `
    <div class="selected-games-preview">
      ${games.map(g => `
        <div class="selected-game-chip">
          <span class="chip-teams">${g.homeTeam || g.teams?.home?.name} vs ${g.awayTeam || g.teams?.away?.name}</span>
          <button class="chip-remove" onclick="toggleGameSelection(${g.id || g.fixture?.id})">×</button>
        </div>
      `).join('')}
    </div>
    
    <button class="floating-analyze-btn" onclick="analyzeSelectedGames()">
      <span class="btn-icon">🎯</span>
      <span class="btn-text">Análise Combinada (${window.selectedGames.length}/${MAX_SELECTION})</span>
    </button>
  `;
}

/**
 * Notificação simples
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${type === 'warning' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}</span>
    <span class="notification-text">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Analisa jogos selecionados
 */
async function analyzeSelectedGames() {
  if (window.selectedGames.length === 0) {
    showNotification('Selecione pelo menos 1 jogo', 'warning');
    return;
  }
  
  if (!window.isPremiumUser || !window.isPremiumUser()) {
    showPremiumModal();
    return;
  }
  
  // Mostrar loading
  showAnalysisLoading();
  
  try {
    const fixtures = window.selectedGames.map(id => ({ fixture_id: id }));
    
    const response = await fetch('/api/ai/analyze-fixtures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtures })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showCombinedAnalysisModal(data);
    } else {
      showNotification(data.message || 'Erro ao gerar análise', 'warning');
    }
  } catch (error) {
    console.error('Erro na análise:', error);
    showNotification('Erro de conexão. Tente novamente.', 'warning');
  }
  
  hideAnalysisLoading();
}

/**
 * Loading de análise
 */
function showAnalysisLoading() {
  const overlay = document.createElement('div');
  overlay.id = 'analysisLoading';
  overlay.className = 'analysis-loading-overlay';
  overlay.innerHTML = `
    <div class="analysis-loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <h3>Gerando Análise Premium</h3>
      <p>Processando dados de ${window.selectedGames.length} jogos...</p>
      <div class="loading-steps">
        <div class="step active">📊 Coletando estatísticas</div>
        <div class="step">⚔️ Analisando confrontos</div>
        <div class="step">🎯 Calculando probabilidades</div>
        <div class="step">💡 Gerando estratégias</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Animar steps
  let step = 0;
  const steps = overlay.querySelectorAll('.step');
  const interval = setInterval(() => {
    step++;
    if (step < steps.length) {
      steps[step].classList.add('active');
    } else {
      clearInterval(interval);
    }
  }, 800);
}

function hideAnalysisLoading() {
  const overlay = document.getElementById('analysisLoading');
  if (overlay) overlay.remove();
}

/**
 * Modal de análise combinada
 */
function showCombinedAnalysisModal(data) {
  const modal = document.createElement('div');
  modal.className = 'analysis-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeCombinedModal(); };
  
  const games = Object.values(data.analysis);
  const combined = data.combined;
  
  modal.innerHTML = `
    <div class="combined-analysis-modal">
      <div class="modal-header">
        <div class="modal-title">
          <span class="title-icon">🎯</span>
          <span>Análise Premium Combinada</span>
        </div>
        <button class="btn-close" onclick="closeCombinedModal()">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Jogos analisados -->
        <div class="analyzed-games">
          ${games.map((game, i) => `
            <div class="analyzed-game">
              <div class="game-number">${i + 1}</div>
              <div class="game-info">
                <div class="game-match">${game.match}</div>
                <div class="game-league">${game.league}</div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Análises individuais -->
        <div class="individual-analyses">
          <h4 class="section-title">📊 Análises Individuais</h4>
          ${games.map((game, i) => `
            <div class="individual-analysis">
              <div class="analysis-game-header">
                <span class="game-badge">${i + 1}</span>
                <span class="game-name">${game.match}</span>
              </div>
              <div class="analysis-text">
                ${formatAnalysisText(game.analysis)}
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Estratégias combinadas -->
        ${combined ? renderCombinedStrategies(combined) : ''}
        
        <!-- Dicas -->
        ${combined?.tips ? `
        <div class="analysis-tips">
          <h4 class="section-title">💡 Dicas</h4>
          <ul class="tips-list">
            ${combined.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeCombinedModal()">Fechar</button>
        <button class="btn-primary" onclick="shareAnalysis()">
          <span class="btn-icon">📤</span>
          Compartilhar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

/**
 * Renderiza estratégias combinadas
 */
function renderCombinedStrategies(combined) {
  if (!combined.strategies) return '';
  
  const { conservative, moderate, aggressive } = combined.strategies;
  
  return `
    <div class="combined-strategies">
      <h4 class="section-title">🎲 Estratégias de Aposta</h4>
      
      <div class="strategies-grid">
        <!-- Conservadora -->
        <div class="strategy-card conservative">
          <div class="strategy-header">
            <span class="strategy-icon">${conservative?.icon || '🛡️'}</span>
            <span class="strategy-name">${conservative?.name || 'Conservadora'}</span>
            <span class="strategy-prob">${conservative?.probability || '70-80%'}</span>
          </div>
          <p class="strategy-desc">${conservative?.description || 'Baixo risco, retorno menor'}</p>
          <div class="strategy-bets">
            ${renderStrategyBets(conservative?.bets)}
          </div>
          <div class="strategy-footer">
            <span class="odds-label">Odds:</span>
            <span class="odds-value">${conservative?.combinedOdds || conservative?.odds || '1.60 - 1.90'}</span>
          </div>
        </div>
        
        <!-- Moderada -->
        <div class="strategy-card moderate ${combined.bestPick?.type === 'moderate' ? 'recommended' : ''}">
          ${combined.bestPick?.type === 'moderate' ? '<div class="recommended-badge">⭐ Recomendada</div>' : ''}
          <div class="strategy-header">
            <span class="strategy-icon">${moderate?.icon || '⚖️'}</span>
            <span class="strategy-name">${moderate?.name || 'Moderada'}</span>
            <span class="strategy-prob">${moderate?.probability || '50-65%'}</span>
          </div>
          <p class="strategy-desc">${moderate?.description || 'Equilíbrio risco/retorno'}</p>
          <div class="strategy-bets">
            ${renderStrategyBets(moderate?.bets)}
          </div>
          <div class="strategy-footer">
            <span class="odds-label">Odds:</span>
            <span class="odds-value">${moderate?.combinedOdds || moderate?.odds || '2.50 - 3.50'}</span>
          </div>
        </div>
        
        <!-- Agressiva -->
        <div class="strategy-card aggressive">
          <div class="strategy-header">
            <span class="strategy-icon">${aggressive?.icon || '🔥'}</span>
            <span class="strategy-name">${aggressive?.name || 'Agressiva'}</span>
            <span class="strategy-prob">${aggressive?.probability || '30-45%'}</span>
          </div>
          <p class="strategy-desc">${aggressive?.description || 'Alto risco, alto retorno'}</p>
          <div class="strategy-bets">
            ${renderStrategyBets(aggressive?.bets)}
          </div>
          <div class="strategy-footer">
            <span class="odds-label">Odds:</span>
            <span class="odds-value">${aggressive?.combinedOdds || aggressive?.odds || '4.00 - 7.00'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza apostas de uma estratégia
 */
function renderStrategyBets(bets) {
  if (!bets || bets.length === 0) return '<p class="no-bets">Sem sugestões</p>';
  
  return bets.map(bet => `
    <div class="strategy-bet">
      <span class="bet-game">${bet.game}</span>
      <span class="bet-market">${bet.market}</span>
      ${bet.reasoning ? `<span class="bet-reason">${bet.reasoning}</span>` : ''}
    </div>
  `).join('');
}

/**
 * Formata texto de análise
 */
function formatAnalysisText(text) {
  if (!text) return '<p>Análise não disponível</p>';
  
  // Converter markdown básico para HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/**
 * Fechar modal
 */
function closeCombinedModal() {
  const modal = document.querySelector('.analysis-modal-overlay');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
}

/**
 * Compartilhar análise
 */
function shareAnalysis() {
  const text = `🎯 Análise Premium Metafy\n\nConfira minha análise combinada de ${window.selectedGames.length} jogos!`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Análise Metafy',
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text);
    showNotification('Copiado para área de transferência!', 'success');
  }
}

/**
 * Limpar seleção
 */
function clearSelection() {
  window.selectedGames = [];
  updateSelectionUI();
  updateFloatingButton();
}

// Exportar para uso global
window.toggleGameSelection = toggleGameSelection;
window.analyzeSelectedGames = analyzeSelectedGames;
window.closeCombinedModal = closeCombinedModal;
window.clearSelection = clearSelection;
window.showNotification = showNotification;
