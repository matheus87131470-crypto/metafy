// Componente Loader - Animação de carregamento premium

export function createLoader(message = 'Carregando...') {
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

export function createSmallLoader() {
  return `<span class="loader-small"></span>`;
}

export function createAILoader() {
  return `
    <div class="ai-loader">
      <div class="ai-brain">🧠</div>
      <div class="ai-dots">
        <span></span><span></span><span></span>
      </div>
      <p>Analisando com IA...</p>
    </div>
  `;
}
