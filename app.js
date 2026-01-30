/**
 * app.js - Script Principal da Plataforma Football AI
 * Integração com APIs reais de jogos e IA
 * Versão: 2.0.0 (Com APIs Reais)
 */

let balanceManager;
let currentSelectedGame = null;
let gamesCache = null;
let isLoadingAnalysis = false;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar
    balanceManager = new BalanceManager();

    // Setup
    setupTabNavigation();
    loadGamesList();
    setupBalanceControls();
    setupGameModal();
    updateTimestamp();

    // Atualizar timestamp a cada segundo
    setInterval(updateTimestamp, 1000);
});

// ====================================
// TAB NAVIGATION
// ====================================

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Remover ativo de todos
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Adicionar ativo ao clicado
            button.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Se for balance, atualizar
            if (tabName === 'balance') {
                updateBalanceDisplay();
            }
        });
    });
}

// ====================================
// GAMES LIST - CARREGAMENTO VIA API
// ====================================

async function loadGamesList() {
    const gamesList = document.getElementById('gamesList');
    
    // Mostrar loading
    gamesList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
            <p style="color: var(--text-secondary);">Carregando jogos reais...</p>
        </div>
    `;

    try {
        // Buscar jogos da API
        const response = await fetch('/api/games');
        const data = await response.json();
        
        if (!data.success || !data.games) {
            throw new Error('Erro ao buscar jogos');
        }
        
        gamesCache = data.games;
        renderGamesList(data.games);
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        gamesList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                <p style="color: var(--text-secondary);">Erro ao carregar jogos. Usando dados locais.</p>
            </div>
        `;
        
        // Fallback para dados locais
        setTimeout(() => {
            if (typeof GamesManager !== 'undefined') {
                const gamesManager = new GamesManager();
                gamesCache = gamesManager.getAllGames();
                renderGamesList(gamesCache);
            }
        }, 1000);
    }
}

function renderGamesList(games) {
    const gamesList = document.getElementById('gamesList');
    gamesList.innerHTML = '';

    if (!games || games.length === 0) {
        gamesList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: var(--text-secondary);">Nenhum jogo disponível</p>
            </div>
        `;
        return;
    }

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-card-header">
                <div class="game-time">${game.time}</div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${game.country || ''}</span>
            </div>
            <div class="game-card-content">
                <div class="game-card-teams">
                    <div class="team">
                        <span class="team-emoji">⚪</span>
                        <span class="team-name">${game.homeTeam}</span>
                    </div>
                    <div class="vs-badge">VS</div>
                    <div class="team">
                        <span class="team-emoji">⚫</span>
                        <span class="team-name">${game.awayTeam}</span>
                    </div>
                </div>
                <div class="game-competition">⚽ ${game.competition}</div>
            </div>
            <button class="btn-analyze" data-game-id="${game.id}">
                🤖 Analisar
            </button>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-analyze')) {
                openGameModal(game.id);
            }
        });

        card.querySelector('.btn-analyze').addEventListener('click', () => {
            openGameModal(game.id);
        });

        gamesList.appendChild(card);
    });
}

// ====================================
// GAME MODAL
// ====================================

function setupGameModal() {
    const modalClose = document.getElementById('modalClose');
    const modal = document.getElementById('gameModal');
    const analysisForm = document.getElementById('analysisForm');

    modalClose.addEventListener('click', closeGameModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeGameModal();
    });

    analysisForm.addEventListener('submit', handleAnalysisSubmit);
}

function openGameModal(gameId) {
    const modal = document.getElementById('gameModal');
    
    // Procurar jogo no cache
    let game = null;
    if (gamesCache) {
        game = gamesCache.find(g => g.id === parseInt(gameId));
    }
    
    if (!game) return;

    currentSelectedGame = game;

    // Preencher dados do jogo
    document.getElementById('modalTitle').textContent = `${game.homeTeam} x ${game.awayTeam}`;
    document.getElementById('homeTeamName').textContent = game.homeTeam;
    document.getElementById('awayTeamName').textContent = game.awayTeam;
    document.getElementById('gameCompetition').textContent = `⚽ ${game.competition}`;

    // Limpar form
    document.getElementById('analysisForm').reset();
    document.getElementById('analysisResult').style.display = 'none';

    // Abrir modal
    modal.classList.add('active');
}

function closeGameModal() {
    const modal = document.getElementById('gameModal');
    modal.classList.remove('active');
    currentSelectedGame = null;
}

async function handleAnalysisSubmit(e) {
    e.preventDefault();

    if (!currentSelectedGame || isLoadingAnalysis) return;

    const market = document.getElementById('marketSelect').value;
    const odd = parseFloat(document.getElementById('oddInput').value);
    const amount = parseFloat(document.getElementById('amountInput').value);

    // Validar
    if (!market || odd < 1.01 || amount < 0.01) {
        alert('⚠️ Preencha todos os campos corretamente');
        return;
    }

    isLoadingAnalysis = true;
    const analyzeBtn = document.querySelector('#analysisForm button');
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '⏳ Analisando com IA...';
    analyzeBtn.disabled = true;

    try {
        const gameData = {
            homeTeam: currentSelectedGame.homeTeam,
            awayTeam: currentSelectedGame.awayTeam,
            competition: currentSelectedGame.competition,
            market,
            odd,
            amount
        };

        // Chamar API de análise
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar análise');
        }

        const result = await response.json();

        if (result.success && result.analysis) {
            displayAnalysisResult(result.analysis, gameData);
        } else {
            alert('❌ Erro ao gerar análise: ' + (result.error || 'Desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao conectar com IA: ' + error.message);
    } finally {
        isLoadingAnalysis = false;
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
}

function displayAnalysisResult(analysis, gameData) {
    const resultDiv = document.getElementById('analysisResult');

    const html = `
        <div class="analysis-container">
            <div class="analysis-header">
                <h3>📊 Análise com IA Real</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Gerada por Inteligência Artificial</p>
            </div>

            <div class="analysis-section">
                <h4>⚽ Contexto do Jogo</h4>
                <p>${analysis.contexto || 'Análise de contexto'}</p>
            </div>

            ${analysis.forma ? `
            <div class="analysis-section">
                <h4>📈 Forma das Equipes</h4>
                <div class="form-comparison">
                    <div class="team-form">
                        <span class="form-label">${gameData.homeTeam}:</span>
                        <span class="form-value">${analysis.forma.homeTeam}</span>
                    </div>
                    <div class="team-form">
                        <span class="form-label">${gameData.awayTeam}:</span>
                        <span class="form-value">${analysis.forma.awayTeam}</span>
                    </div>
                </div>
                <p class="form-comparison-text">${analysis.forma.comparacao}</p>
            </div>
            ` : ''}

            <div class="analysis-section">
                <h4>💎 Análise da Aposta</h4>
                <div class="betting-info">
                    <div class="info-item">
                        <span class="label">Mercado:</span>
                        <span class="value">${gameData.market}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Odd:</span>
                        <span class="value">${gameData.odd}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Aposta:</span>
                        <span class="value">${balanceManager.formatCurrency(gameData.amount)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Ganho Potencial:</span>
                        <span class="value gain">${balanceManager.formatCurrency(analysis.ganho_potencial || (gameData.amount * gameData.odd))}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ROI:</span>
                        <span class="value">${analysis.roi || ((gameData.amount * gameData.odd - gameData.amount) / gameData.amount * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>🎯 Grau de Risco</h4>
                <div class="risk-badge ${analysis.risco}">
                    ${analysis.risco === 'LOW' ? '🟢 BAIXO' : analysis.risco === 'MEDIUM' ? '🟡 MÉDIO' : '🔴 ALTO'}
                </div>
                <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-secondary);">${analysis.risco_descricao || ''}</p>
            </div>

            ${analysis.observacoes && analysis.observacoes.length > 0 ? `
            <div class="analysis-section">
                <h4>💡 Observações Técnicas</h4>
                <ul class="observations-list">
                    ${analysis.observacoes.map(obs => `<li>• ${obs}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="analysis-section">
                <h4>✅ Recomendação Final</h4>
                <div class="recommendation-box ${analysis.risco}">
                    ${analysis.recomendacao || 'Análise concluída'}
                </div>
            </div>

            <button class="btn-primary btn-full" onclick="registerBetFromAnalysis()">
                📊 Registrar Aposta
            </button>
        </div>
    `;

    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

function registerBetFromAnalysis() {
    const oddInput = document.getElementById('oddInput');
    const amountInput = document.getElementById('amountInput');
    
    const odd = parseFloat(oddInput.value);
    const amount = parseFloat(amountInput.value);
    
    if (odd && amount) {
        const potentialGain = amount * odd;
        balanceManager.addGain(potentialGain);
        updateBalanceDisplay();
        alert(`✅ Aposta registrada! Ganho potencial: ${balanceManager.formatCurrency(potentialGain)}`);
        closeGameModal();
    }
}

// ====================================
// BALANCE CONTROLS
// ====================================

function setupBalanceControls() {
    const gainBtn = document.getElementById('addGainBtn');
    const lossBtn = document.getElementById('addLossBtn');
    const gainInput = document.getElementById('gainInput');
    const lossInput = document.getElementById('lossInput');

    gainBtn.addEventListener('click', () => {
        const amount = parseFloat(gainInput.value);
        if (amount > 0) {
            balanceManager.addGain(amount);
            gainInput.value = '';
            updateBalanceDisplay();
        } else {
            alert('⚠️ Digite um valor válido');
        }
    });

    lossBtn.addEventListener('click', () => {
        const amount = parseFloat(lossInput.value);
        if (amount > 0) {
            balanceManager.addLoss(amount);
            lossInput.value = '';
            updateBalanceDisplay();
        } else {
            alert('⚠️ Digite um valor válido');
        }
    });

    // Enter para enviar
    gainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') gainBtn.click();
    });

    lossInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') lossBtn.click();
    });

    // Atualizar ao carregar
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    const gains = balanceManager.gains;
    const losses = balanceManager.losses;
    const balance = balanceManager.getBalance();
    const percentages = balanceManager.getBalancePercentages();

    // Atualizar valores com animação
    animateValue('totalGains', gains);
    animateValue('totalLosses', losses);
    animateValue('balanceValue', balance);

    // Atualizar barra com animação suave
    const barGain = document.getElementById('barGain');
    const barLoss = document.getElementById('barLoss');
    
    setTimeout(() => {
        barGain.style.width = percentages.gains + '%';
        barLoss.style.width = percentages.losses + '%';
    }, 100);

    // Atualizar histórico
    updateHistoryDisplay();
}

/**
 * Anima a mudança de valor do currency
 */
function animateValue(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const currentText = element.textContent;
    const currentValue = parseFloat(currentText.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    
    const duration = 400;
    const startTime = Date.now();
    const diff = finalValue - currentValue;

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = currentValue + (diff * progress);
        
        element.textContent = formatter.format(value);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

    // Atualizar barra
    document.getElementById('barGain').style.width = percentages.gains + '%';
    document.getElementById('barLoss').style.width = percentages.losses + '%';

    // Atualizar histórico
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    const transactions = balanceManager.getRecentTransactions(20);

    if (transactions.length === 0) {
        historyList.innerHTML = '<div class="empty-message">Nenhuma transação registrada</div>';
        return;
    }

    historyList.innerHTML = transactions.map(t => `
        <div class="history-item ${t.type}">
            <span class="history-icon">${t.type === 'gain' ? '✅' : '❌'}</span>
            <span class="history-amount">${balanceManager.formatCurrency(t.amount)}</span>
            <span class="history-time">${t.timestamp}</span>
        </div>
    `).join('');
}

// ====================================
// UTILITIES
// ====================================

function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        timestampEl.textContent = timeString;
    }
}
