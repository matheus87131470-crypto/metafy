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
      html += isLocked ? renderLockedCard(pick) : renderPickCard(pick, isPremium);
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
    if (pick.rating === 'Forte' || pick.rating === 'Forte oportunidade') {
      return '<span class="tp-rating-badge tp-rating-badge--strong">🔥 Forte</span>';
    }
    if (pick.rating === 'Moderada' || pick.rating === 'Valor moderado') {
      return '<span class="tp-rating-badge tp-rating-badge--moderate">📊 Moderada</span>';
    }
    if (pick.rating === 'Leve') {
      return '<span class="tp-rating-badge tp-rating-badge--moderate">📉 Leve</span>';
    }
    if (pick.rating === 'Alto risco') {
      return '<span class="tp-rating-badge tp-rating-badge--watch">⚠️ Alto risco</span>';
    }
    if (pick.rating === 'fallback') {
      return '<span class="tp-rating-badge tp-rating-badge--watch">👁 Em observação</span>';
    }
    return '';
  }

  // ————— Card desbloqueado —————
  function renderPickCard(pick, isPremium) {
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

        ${pick.bestPickLabel && pick.bestPickLabel !== '—' ? `
        <div class="tp-direction">
          <span class="tp-direction-label">Direção:</span>
          <span class="tp-direction-value">${pick.bestPickLabel}</span>
          ${pick.rating && pick.rating !== 'fallback' ? `<span class="tp-direction-conf">(${pick.rating})</span>` : ''}
        </div>` : ''}

        <div class="tp-pick-chip">
          <span class="tp-market">${pick.market}:</span>
          <span class="tp-pick-label">${pick.pick}</span>
        </div>

        <div class="tp-actions">
          <button class="tp-btn tp-btn--free" onclick="topPicksToggleAnalysis('${pick.id}')">
            ⚡ VER ANÁLISE COMPLETA
          </button>
          ${(!pick.statusGroup || pick.statusGroup === 'upcoming')
            ? (isPremium || pick.iaFree
                ? `<button class="tp-btn tp-btn--ai" onclick="topPicksAnalyzeAI('${pick.id}')">🤖 ANALISAR COM IA</button>`
                : `<button class="tp-btn tp-btn--ai" onclick="topPicksAnalyzeAI('${pick.id}')">🔒 IA (Premium)</button>`)
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
    const pick = (window.TOP_PICKS_TODAY || []).find(p => p.id === pickId);
    if (!isPremium && !pick?.iaFree) {
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

    if (!pick) return;
    console.log('🤖 Analisando com IA:', pick);
    openAIModal(pick);
  };

  // ————— Modal IA —————
  function buildSummary(pick) {
    const edge = pick.edge ?? 0;
    const label = pick.bestPickLabel || pick.pick || 'Melhor opção';
    const conf = pick.rating || 'Leve';
    if (conf === 'Forte' || conf === 'Moderada')
      return `A melhor relação risco/retorno hoje está em ${label}, com edge de ${Number(edge).toFixed(2)}%.`;
    if (conf === 'Leve')
      return `A direção mais consistente é ${label}, mas com edge baixo; stake conservadora.`;
    return `Mercado sem valor estatístico; se entrar, faça stake mínima. Melhor opção ainda é ${label}.`;
  }

  function openAIModal(pick) {
    // Injeta modal no DOM se ainda não existir
    if (!document.getElementById('tp-ai-modal')) {
      const modalEl = document.createElement('div');
      modalEl.id = 'tp-ai-modal';
      modalEl.className = 'tp-modal-overlay';
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.innerHTML = `
        <div class="tp-modal">
          <button class="tp-modal-close" onclick="closeTpAIModal()" aria-label="Fechar">&times;</button>
          <div id="tp-modal-body"></div>
        </div>`;
      modalEl.addEventListener('click', e => { if (e.target === modalEl) closeTpAIModal(); });
      document.body.appendChild(modalEl);

      // Estilos injetados uma única vez
      const style = document.createElement('style');
      style.textContent = `
        .tp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;}
        .tp-modal{background:#1a1f2e;border:1px solid rgba(255,255,255,.1);border-radius:16px;width:100%;max-width:480px;position:relative;padding:28px 24px 24px;}
        .tp-modal-close{position:absolute;top:12px;right:14px;background:none;border:none;color:#9ca3af;font-size:1.4rem;cursor:pointer;line-height:1;}
        .tp-modal-close:hover{color:#fff;}
        .tp-modal-title{font-size:1rem;font-weight:700;color:#e5e7eb;margin-bottom:18px;}
        .tp-modal-best{font-size:1.25rem;font-weight:800;color:#fbbf24;margin-bottom:6px;}
        .tp-modal-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.8rem;font-weight:700;margin-bottom:14px;}
        .tp-modal-badge.forte{background:rgba(16,185,129,.15);color:#10b981;border:1px solid #10b981;}
        .tp-modal-badge.moderada{background:rgba(59,130,246,.15);color:#60a5fa;border:1px solid #60a5fa;}
        .tp-modal-badge.leve{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid #fbbf24;}
        .tp-modal-badge.alto-risco{background:rgba(239,68,68,.15);color:#f87171;border:1px solid #f87171;}
        .tp-modal-edge{font-size:.8rem;color:#9ca3af;margin-bottom:16px;}
        .tp-modal-summary{font-size:.9rem;color:#d1d5db;margin-bottom:14px;line-height:1.5;}
        .tp-modal-bullets{list-style:none;padding:0;margin:0 0 18px;display:flex;flex-direction:column;gap:6px;}
        .tp-modal-bullets li{font-size:.85rem;color:#d1d5db;padding:6px 10px;background:rgba(255,255,255,.04);border-radius:8px;border-left:3px solid rgba(251,191,36,.4);}
        .tp-modal-actions{display:flex;justify-content:flex-end;}
        .tp-modal-btn-close{padding:8px 20px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#e5e7eb;font-size:.9rem;cursor:pointer;}
        .tp-modal-btn-close:hover{background:rgba(255,255,255,.15);}
        .tp-modal-loading{text-align:center;color:#9ca3af;font-size:.95rem;padding:20px 0;}
      `;
      document.head.appendChild(style);
    }

    const overlay = document.getElementById('tp-ai-modal');
    const body    = document.getElementById('tp-modal-body');

    // Loading
    body.innerHTML = `<p class="tp-modal-loading">🤖 Analisando...</p>`;
    overlay.style.display = 'flex';

    // Gera resposta local (instantânea, sem backend)
    const summary  = buildSummary(pick);
    const conf     = pick.rating || 'Leve';
    const badgeCls = conf === 'Forte' ? 'forte' : conf === 'Moderada' ? 'moderada' : conf === 'Alto risco' ? 'alto-risco' : 'leve';
    const bullets  = pick.keyStats && pick.keyStats.length >= 3
      ? pick.keyStats.slice(0, 3)
      : [
          `Pick: ${pick.bestPickLabel || pick.pick}`,
          pick.explanation || 'Sem dados adicionais',
          `Confiança calculada: ${pick.confidencePct}%`,
        ];

    body.innerHTML = `
      <p class="tp-modal-title">🤖 Análise IA: ${pick.home} vs ${pick.away}</p>
      <p class="tp-modal-best">⭐ Melhor Opção: ${pick.bestPickLabel || pick.pick}</p>
      <span class="tp-modal-badge ${badgeCls}">📊 Confiança: ${conf}</span>
      <p class="tp-modal-edge">📈 Edge: ${Number(pick.edge ?? 0).toFixed(2)}%  |  Prob ajustada: ${Number(pick.probAdjusted ?? 0).toFixed(1)}% vs implícita: ${Number(pick.probImplied ?? 0).toFixed(1)}%</p>
      <p class="tp-modal-summary">${summary}</p>
      <ul class="tp-modal-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      <div class="tp-modal-actions">
        <button class="tp-modal-btn-close" onclick="closeTpAIModal()">Fechar</button>
      </div>
    `;
  }

  window.closeTpAIModal = function () {
    const el = document.getElementById('tp-ai-modal');
    if (el) el.style.display = 'none';
  };

  // ————— Modal IA —————
  function buildSummary(pick) {
    const edge = pick.edge ?? 0;
    const label = pick.bestPickLabel || pick.pick || 'Melhor opção';
    const conf = pick.rating || 'Leve';
    if (conf === 'Forte' || conf === 'Moderada')
      return `A melhor relação risco/retorno hoje está em ${label}, com edge de ${Number(edge).toFixed(2)}%.`;
    if (conf === 'Leve')
      return `A direção mais consistente é ${label}, mas com edge baixo; stake conservadora.`;
    return `Mercado sem valor estatístico; se entrar, faça stake mínima. Melhor opção ainda é ${label}.`;
  }

  function openAIModal(pick) {
    if (!document.getElementById('tp-ai-modal')) {
      const modalEl = document.createElement('div');
      modalEl.id = 'tp-ai-modal';
      modalEl.className = 'tp-modal-overlay';
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.innerHTML = `
        <div class="tp-modal">
          <button class="tp-modal-close" onclick="closeTpAIModal()" aria-label="Fechar">&times;</button>
          <div id="tp-modal-body"></div>
        </div>`;
      modalEl.addEventListener('click', e => { if (e.target === modalEl) closeTpAIModal(); });
      document.body.appendChild(modalEl);

      const style = document.createElement('style');
      style.textContent = [
        '.tp-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;}',
        '.tp-modal{background:#1a1f2e;border:1px solid rgba(255,255,255,.1);border-radius:16px;width:100%;max-width:480px;position:relative;padding:28px 24px 24px;}',
        '.tp-modal-close{position:absolute;top:12px;right:14px;background:none;border:none;color:#9ca3af;font-size:1.4rem;cursor:pointer;line-height:1;}',
        '.tp-modal-close:hover{color:#fff;}',
        '.tp-modal-title{font-size:1rem;font-weight:700;color:#e5e7eb;margin:0 0 18px;}',
        '.tp-modal-best{font-size:1.25rem;font-weight:800;color:#fbbf24;margin:0 0 8px;}',
        '.tp-modal-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.8rem;font-weight:700;margin-bottom:12px;}',
        '.tp-modal-badge.forte{background:rgba(16,185,129,.15);color:#10b981;border:1px solid #10b981;}',
        '.tp-modal-badge.moderada{background:rgba(59,130,246,.15);color:#60a5fa;border:1px solid #60a5fa;}',
        '.tp-modal-badge.leve{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid #fbbf24;}',
        '.tp-modal-badge.alto-risco{background:rgba(239,68,68,.15);color:#f87171;border:1px solid #f87171;}',
        '.tp-modal-edge{font-size:.8rem;color:#9ca3af;margin:0 0 14px;}',
        '.tp-modal-summary{font-size:.9rem;color:#d1d5db;margin:0 0 14px;line-height:1.6;}',
        '.tp-modal-bullets{list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:6px;}',
        '.tp-modal-bullets li{font-size:.85rem;color:#d1d5db;padding:7px 10px;background:rgba(255,255,255,.04);border-radius:8px;border-left:3px solid rgba(251,191,36,.4);}',
        '.tp-modal-actions{display:flex;justify-content:flex-end;}',
        '.tp-modal-btn-close{padding:8px 20px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#e5e7eb;font-size:.9rem;cursor:pointer;}',
        '.tp-modal-btn-close:hover{background:rgba(255,255,255,.15);}',
        '.tp-modal-loading{text-align:center;color:#9ca3af;font-size:.95rem;padding:20px 0;}',
        '.tp-direction{display:flex;align-items:center;gap:6px;font-size:.82rem;margin:6px 0 10px;padding:5px 10px;background:rgba(251,191,36,.07);border-radius:8px;}',
        '.tp-direction-label{color:#9ca3af;}',
        '.tp-direction-value{color:#fbbf24;font-weight:700;}',
        '.tp-direction-conf{color:#6b7280;font-size:.78rem;}',
      ].join('');
      document.head.appendChild(style);
    }

    const overlay = document.getElementById('tp-ai-modal');
    const body    = document.getElementById('tp-modal-body');
    body.innerHTML = '<p class="tp-modal-loading">🤖 Analisando...</p>';
    overlay.style.display = 'flex';

    const summary  = buildSummary(pick);
    const conf     = pick.rating || 'Leve';
    const badgeCls = conf === 'Forte' ? 'forte' : conf === 'Moderada' ? 'moderada' : conf === 'Alto risco' ? 'alto-risco' : 'leve';
    const bullets  = pick.keyStats && pick.keyStats.length >= 3
      ? pick.keyStats.slice(0, 3)
      : [
          `Pick: ${pick.bestPickLabel || pick.pick || '?'}`,
          pick.explanation || 'Análise baseada em probabilidades calc. localmente.',
          `Confiança calculada: ${pick.confidencePct}%`,
        ];

    body.innerHTML = `
      <p class="tp-modal-title">🤖 Análise IA: ${pick.home} vs ${pick.away}</p>
      <p class="tp-modal-best">⭐ Melhor Opção: ${pick.bestPickLabel || pick.pick}</p>
      <span class="tp-modal-badge ${badgeCls}">📊 Confiança: ${conf}</span>
      <p class="tp-modal-edge">📈 Edge: ${Number(pick.edge ?? 0).toFixed(2)}%  |  Prob ajustada: ${Number(pick.probAdjusted ?? 0).toFixed(1)}% vs implícita: ${Number(pick.probImplied ?? 0).toFixed(1)}%</p>
      <p class="tp-modal-summary">${summary}</p>
      <ul class="tp-modal-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      <div class="tp-modal-actions">
        <button class="tp-modal-btn-close" onclick="closeTpAIModal()">Fechar</button>
      </div>`;
  }

  window.closeTpAIModal = function () {
    const el = document.getElementById('tp-ai-modal');
    if (el) el.style.display = 'none';
  };

  // ————— Export —————
  window.renderTopPicks = renderTopPicks;
})();
