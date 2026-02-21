// =====================================================
// src/ui/TopPicks.js
// Seção "Top Picks" — grid de cards com accordion
// =====================================================

(function () {
  // ————— Estado local —————
  const expandedIds = new Set();

  // ————— Render principal —————
  function renderTopPicks(picks, containerId) {
    const container = document.getElementById(containerId || 'topPicksSection');
    if (!container) return;

    if (!picks || picks.length === 0) {
      container.innerHTML = '<p class="tp-empty">Nenhum pick disponível hoje.</p>';
      return;
    }

    // Determinar quantos cards ficam desbloqueados vs bloqueados
    const isPremium = (typeof isPremiumUser === 'function') ? isPremiumUser() : false;
    const freeLimit = 2; // primeiros 2 cards grátis visíveis

    let html = `
      <section class="tp-section">
        <div class="tp-header">
          <div class="tp-title-group">
            <span class="tp-title-icon">⚡</span>
            <h2 class="tp-title">Top Picks <span class="tp-today-badge">Hoje</span></h2>
          </div>
          <span class="tp-counter">${picks.length} análises</span>
        </div>
        <div class="tp-grid">
    `;

    picks.forEach((pick, index) => {
      const isLocked = !isPremium && index >= freeLimit;
      html += isLocked ? renderLockedCard(index) : renderPickCard(pick);
    });

    html += `
        </div>
      </section>
    `;

    container.innerHTML = html;
  }

  // ————— Card desbloqueado —————
  function renderPickCard(pick) {
    const isExpanded = expandedIds.has(pick.id);
    const levelColor = pick.levelClass === 'high' ? 'var(--tp-high)' :
                       pick.levelClass === 'medium' ? 'var(--tp-medium)' : 'var(--tp-low)';

    return `
      <div class="tp-card tp-card--${pick.levelClass}" data-pick-id="${pick.id}">
        <div class="tp-card-header">
          <span class="tp-league">${pick.league}</span>
          <span class="tp-time">${pick.time}</span>
        </div>

        <div class="tp-teams">
          <span class="tp-team">${pick.home}</span>
          <span class="tp-vs">vs</span>
          <span class="tp-team">${pick.away}</span>
        </div>

        <div class="tp-confidence">
          <div class="tp-pct" style="color:${levelColor}">${pick.confidencePct}%</div>
          <div class="tp-level">${pick.confidenceLevel}</div>
        </div>

        <div class="tp-pick-chip">
          <span class="tp-market">${pick.market}:</span>
          <span class="tp-pick-label">${pick.pick}</span>
        </div>

        <div class="tp-actions">
          <button class="tp-btn tp-btn--free" onclick="topPicksToggleAnalysis('${pick.id}')">
            ⚡ VER ANÁLISE COMPLETA
          </button>
          <button class="tp-btn tp-btn--ai" onclick="topPicksAnalyzeAI('${pick.id}')">
            🤖 ANALISAR COM IA
          </button>
        </div>

        <div class="tp-accordion ${isExpanded ? 'tp-accordion--open' : ''}" id="tp-acc-${pick.id}">
          <div class="tp-accordion-inner">
            <p class="tp-explanation">${pick.explanation}</p>
            <ul class="tp-stats">
              ${(pick.keyStats || []).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // ————— Card bloqueado —————
  function renderLockedCard(index) {
    return `
      <div class="tp-card tp-card--locked">
        <div class="tp-locked-overlay">
          <div class="tp-lock-icon">🔒</div>
          <p class="tp-lock-msg">Desbloqueie todas as análises com Premium</p>
          <button class="tp-btn tp-btn--unlock" onclick="activatePremium ? activatePremium() : alert('Faça upgrade para Premium')">
            ✨ Fazer Upgrade
          </button>
        </div>
      </div>
    `;
  }

  // ————— Toggle accordion —————
  window.topPicksToggleAnalysis = function (pickId) {
    const acc = document.getElementById('tp-acc-' + pickId);
    if (!acc) return;

    if (expandedIds.has(pickId)) {
      expandedIds.delete(pickId);
      acc.classList.remove('tp-accordion--open');
    } else {
      expandedIds.add(pickId);
      acc.classList.add('tp-accordion--open');
    }
  };

  // ————— Botão IA —————
  window.topPicksAnalyzeAI = function (pickId) {
    const isPremium = (typeof isPremiumUser === 'function') ? isPremiumUser() : false;
    if (!isPremium) {
      if (typeof activatePremium === 'function') {
        activatePremium();
      } else {
        // Mostra card bloqueado inline
        const card = document.querySelector(`.tp-card[data-pick-id="${pickId}"]`);
        if (card) {
          let blocker = card.querySelector('.tp-ai-blocker');
          if (!blocker) {
            blocker = document.createElement('div');
            blocker.className = 'tp-ai-blocker';
            blocker.innerHTML = `
              <div class="tp-locked-overlay">
                <div class="tp-lock-icon">🔒</div>
                <p class="tp-lock-msg">Desbloqueie todas as análises com Premium</p>
                <button class="tp-btn tp-btn--unlock" onclick="this.closest('.tp-ai-blocker').remove()">✕ Fechar</button>
              </div>
            `;
            card.appendChild(blocker);
          }
        }
      }
      return;
    }

    const pick = (window.TOP_PICKS_TODAY || []).find(p => p.id === pickId);
    if (!pick) return;
    console.log('🤖 Analisando com IA:', pick);
    alert(`🤖 Análise IA: ${pick.home} vs ${pick.away}\nPick: ${pick.pick} (${pick.confidencePct}%)\n\n${pick.explanation}`);
  };

  // ————— Export —————
  window.renderTopPicks = renderTopPicks;
})();
