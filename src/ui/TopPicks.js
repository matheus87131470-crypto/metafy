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
        <p class="tp-schedule-note">Top Picks definidos às 09:00 (BRT) e fixos até 23:59.</p>
        <div class="tp-grid">
    `;

    let lastGroup = null;
    picks.forEach((pick, index) => {
      // Separador de seção quando o grupo muda
      if (pick.statusGroup && pick.statusGroup !== lastGroup) {
        lastGroup = pick.statusGroup;
        const seps = {
          live:     `<div class="tp-section-sep tp-section-sep--live"><span class="tp-sep-pulse"></span>Ao Vivo Agora</div>`,
          upcoming: `<div class="tp-section-sep tp-section-sep--upcoming"><span>⏳</span> Próximos</div>`,
          finished: `<div class="tp-section-sep tp-section-sep--finished"><span>✓</span> Encerrados Hoje</div>`,
        };
        if (seps[pick.statusGroup]) html += seps[pick.statusGroup];
      }
      const isLocked = !isPremium && index >= freeLimit;
      html += isLocked ? renderLockedCard(pick) : renderPickCard(pick);
    });

    html += `
        </div>
      </section>
    `;

    container.innerHTML = html;
  }

  // ————— Badge por status / rating —————
  function ratingBadge(pick) {
    // Status sobrescreve rating: live e finished têm badges próprios
    if (pick.statusGroup === 'live') {
      return '<span class="tp-status-badge tp-status-badge--live"><span class="tp-live-dot"></span>AO VIVO</span>';
    }
    if (pick.statusGroup === 'finished') {
      return '<span class="tp-status-badge tp-status-badge--finished">✓ Encerrado</span>';
    }
    // upcoming → badge de rating
    if (pick.rating === 'Forte oportunidade') {
      return '<span class="tp-rating-badge tp-rating-badge--strong">🔥 Forte oportunidade</span>';
    }
    if (pick.rating === 'Valor moderado') {
      return '<span class="tp-rating-badge tp-rating-badge--moderate">📊 Valor moderado</span>';
    }
    if (pick.rating === 'fallback') {
      return '<span class="tp-rating-badge tp-rating-badge--watch">👁 Em observação</span>';
    }
    return '';
  }

  // ————— Card desbloqueado —————
  function renderPickCard(pick) {
    const isExpanded = expandedIds.has(pick.id);
    const levelColor = pick.levelClass === 'high' ? 'var(--tp-high)' :
                       pick.levelClass === 'medium' ? 'var(--tp-medium)' : 'var(--tp-low)';
    const strongClass = pick.rating === 'Forte oportunidade' ? ' tp-card--strong' : '';

    return `
      <div class="tp-card tp-card--${pick.levelClass}${strongClass}" data-pick-id="${pick.id}">
        <div class="tp-card-header">
          <span class="tp-league">${pick.league}</span>
          <span class="tp-time">${pick.time}</span>
        </div>
        <div class="tp-card-badge">${ratingBadge(pick)}</div>

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
          ${(!pick.statusGroup || pick.statusGroup === 'upcoming')
            ? `<button class="tp-btn tp-btn--ai" onclick="topPicksAnalyzeAI('${pick.id}')">🤖 ANALISAR COM IA</button>`
            : `<button class="tp-btn tp-btn--ai tp-btn--disabled" disabled>🤖 IA (apenas pré-jogo)</button>`
          }
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

  // ————— Card bloqueado com preview —————
  function renderLockedCard(pick) {
    const levelColor = pick.levelClass === 'high' ? 'var(--tp-high)' :
                       pick.levelClass === 'medium' ? 'var(--tp-medium)' : 'var(--tp-low)';
    const strongClass = pick.rating === 'Forte oportunidade' ? ' tp-card--strong' : '';

    // Preview: 1 frase da explanation (até 80 chars) + 1 bullet sem número
    const previewText = (pick.explanation || '').split('.')[0] + '.';
    const previewBullet = (pick.keyStats || [])[0]
      ? (pick.keyStats[0]).replace(/[\d,.]+/g, '···') // oculta números específicos
      : '';

    // Blurred content: bullets restantes + botões
    const blurredBullets = (pick.keyStats || []).slice(1).map(s => `<li>${s}</li>`).join('');

    return `
      <div class="tp-card tp-card--${pick.levelClass}${strongClass} tp-card--preview" data-pick-id="${pick.id}">
        <div class="tp-card-header">
          <span class="tp-league">${pick.league}</span>
          <span class="tp-time">${pick.time}</span>
        </div>
        <div class="tp-card-badge">${ratingBadge(pick)}</div>

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

        <!-- Preview visível: 1 frase + 1 bullet sem números -->
        <div class="tp-preview-visible">
          <p class="tp-explanation">${previewText}</p>
          ${previewBullet ? `<ul class="tp-stats tp-stats--preview"><li>${previewBullet}</li></ul>` : ''}
        </div>

        <!-- Conteúdo borrado -->
        <div class="tp-premium-blur" aria-hidden="true">
          ${blurredBullets ? `<ul class="tp-stats"><li>···</li>${blurredBullets}</ul>` : ''}
          <div class="tp-actions">
            <button class="tp-btn tp-btn--free" tabindex="-1">⚡ VER ANÁLISE COMPLETA</button>
            <button class="tp-btn tp-btn--ai" tabindex="-1">🤖 ANALISAR COM IA</button>
          </div>
        </div>

        <!-- Overlay de upgrade -->
        <div class="tp-premium-overlay" onclick="typeof activatePremium === 'function' ? activatePremium() : null">
          <div class="tp-premium-overlay-inner">
            <span class="tp-lock-icon">🔒</span>
            <p class="tp-lock-msg">Desbloqueie a análise completa com Premium</p>
            <button class="tp-btn tp-btn--unlock" onclick="event.stopPropagation(); typeof activatePremium === 'function' ? activatePremium() : alert('Upgrade para Premium')">
              ✨ FAZER UPGRADE
            </button>
          </div>
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
