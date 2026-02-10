// Componente PremiumBadge - Badge e elementos premium

export function createPremiumBadge() {
  return `
    <div class="premium-badge" title="Análises avançadas com IA">
      <span class="badge-icon">💎</span>
      <span class="badge-text">Premium</span>
    </div>
  `;
}

export function createDemoBanner() {
  return `
    <div class="demo-banner">
      <span class="demo-icon">🧪</span>
      <span class="demo-text">Modo demonstração — dados simulados</span>
    </div>
  `;
}

export function createAnalysisCounter(remaining) {
  return `
    <div class="analysis-counter">
      <span class="counter-icon">⚡</span>
      <span class="counter-text">${remaining}/3 análises restantes</span>
    </div>
  `;
}

export function createFeatureComparison() {
  return `
    <div class="feature-comparison">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Recurso</th>
            <th>Free</th>
            <th class="premium-col">Premium 💎</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Análises/dia</td>
            <td>3</td>
            <td class="premium-col">∞</td>
          </tr>
          <tr>
            <td>Histórico</td>
            <td>❌</td>
            <td class="premium-col">✅</td>
          </tr>
          <tr>
            <td>Over/Under</td>
            <td>❌</td>
            <td class="premium-col">✅</td>
          </tr>
          <tr>
            <td>Ambas Marcam</td>
            <td>❌</td>
            <td class="premium-col">✅</td>
          </tr>
          <tr>
            <td>Stats Avançados</td>
            <td>❌</td>
            <td class="premium-col">✅</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
