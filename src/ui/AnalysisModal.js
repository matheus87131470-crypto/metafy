// Componente AnalysisModal - Modal de análise IA premium

export function createAnalysisModal(game, analysis) {
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

  return `
    <div class="analysis-modal-overlay" onclick="closeAnalysisModal(event)">
      <div class="analysis-modal" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="analysis-header">
          <div class="analysis-title">
            <span class="ai-icon">🧠</span>
            <span>Análise IA</span>
          </div>
          <button class="btn-close" onclick="closeAnalysisModal()">✕</button>
        </div>

        <!-- Match Info -->
        <div class="analysis-match">
          <div class="match-teams">
            <span class="team">${game.homeTeam}</span>
            <span class="vs">vs</span>
            <span class="team">${game.awayTeam}</span>
          </div>
          <div class="match-competition">
            ${game.competitionLogo || '⚽'} ${game.competition}
          </div>
        </div>

        <!-- Previsão Principal -->
        <div class="analysis-prediction">
          <div class="prediction-main">
            <span class="prediction-label">Previsão</span>
            <span class="prediction-value">${analysis.prediction.text}</span>
            <span class="prediction-prob">${analysis.prediction.probability}%</span>
          </div>
          <div class="confidence-badge ${confidenceClass}">
            Confiança: ${confidenceText}
          </div>
        </div>

        <!-- Probabilidades -->
        <div class="analysis-section">
          <h4 class="section-title">📊 Probabilidades</h4>
          <div class="prob-bars">
            <div class="prob-item">
              <span class="prob-label">${game.homeTeam}</span>
              <div class="prob-bar">
                <div class="prob-fill home" style="width: ${analysis.probabilities.home}%"></div>
              </div>
              <span class="prob-value">${analysis.probabilities.home}%</span>
            </div>
            <div class="prob-item">
              <span class="prob-label">Empate</span>
              <div class="prob-bar">
                <div class="prob-fill draw" style="width: ${analysis.probabilities.draw}%"></div>
              </div>
              <span class="prob-value">${analysis.probabilities.draw}%</span>
            </div>
            <div class="prob-item">
              <span class="prob-label">${game.awayTeam}</span>
              <div class="prob-bar">
                <div class="prob-fill away" style="width: ${analysis.probabilities.away}%"></div>
              </div>
              <span class="prob-value">${analysis.probabilities.away}%</span>
            </div>
          </div>
        </div>

        <!-- Mercados -->
        <div class="analysis-section">
          <h4 class="section-title">🎯 Mercados</h4>
          <div class="markets-grid">
            <div class="market-card">
              <span class="market-name">Over 2.5 Gols</span>
              <span class="market-value ${analysis.markets.overUnder.over25 > 50 ? 'positive' : 'negative'}">
                ${analysis.markets.overUnder.over25}%
              </span>
            </div>
            <div class="market-card">
              <span class="market-name">Under 2.5 Gols</span>
              <span class="market-value ${analysis.markets.overUnder.under25 > 50 ? 'positive' : 'negative'}">
                ${analysis.markets.overUnder.under25}%
              </span>
            </div>
            <div class="market-card">
              <span class="market-name">Ambas Marcam</span>
              <span class="market-value ${analysis.markets.btts.yes > 50 ? 'positive' : 'negative'}">
                Sim ${analysis.markets.btts.yes}%
              </span>
            </div>
            <div class="market-card">
              <span class="market-name">Não Ambas</span>
              <span class="market-value ${analysis.markets.btts.no > 50 ? 'positive' : 'negative'}">
                ${analysis.markets.btts.no}%
              </span>
            </div>
          </div>
        </div>

        <!-- Forma Recente -->
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

        <!-- Raciocínio -->
        <div class="analysis-section">
          <h4 class="section-title">💡 Análise</h4>
          <ul class="reasoning-list">
            ${analysis.reasoning.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <!-- Footer -->
        <div class="analysis-footer">
          <div class="remaining-badge">
            ⚡ ${analysis.remaining !== undefined ? analysis.remaining : '∞'} análises restantes hoje
          </div>
        </div>
      </div>
    </div>
  `;
}

export function createPremiumModal() {
  return `
    <div class="analysis-modal-overlay" onclick="closeAnalysisModal(event)">
      <div class="premium-modal" onclick="event.stopPropagation()">
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
        
        <button class="btn-premium-cta" disabled>
          🚀 Em breve
        </button>
        
        <p class="premium-note">Volte amanhã para mais 3 análises gratuitas!</p>
      </div>
    </div>
  `;
}
