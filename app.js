/**
 * app.js - Script Principal da Plataforma Football AI
 * Orquestra toda a lógica do aplicativo
 */

let gamesManager;
let footballAnalyzer;
let balanceManager;
let currentSelectedGame = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar
    gamesManager = new GamesManager();
    footballAnalyzer = new FootballAnalyzer();
    balanceManager = new BalanceManager();

    // Setup
    setupTabNavigation();
    setupGamesList();
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
// GAMES LIST
// ====================================

function setupGamesList() {
    const gamesList = document.getElementById('gamesList');
    const games = gamesManager.getAllGames();

    gamesList.innerHTML = '';

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-card-header">
                <div class="game-time">${game.time}</div>
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
                <div class="game-competition">${gamesManager.formatCompetition(game.competition)}</div>
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
    const game = gamesManager.getGameById(gameId);
    
    if (!game) return;

    currentSelectedGame = game;

    // Preencher dados do jogo
    document.getElementById('modalTitle').textContent = `${game.homeTeam} x ${game.awayTeam}`;
    document.getElementById('homeTeamName').textContent = game.homeTeam;
    document.getElementById('awayTeamName').textContent = game.awayTeam;
    document.getElementById('gameCompetition').textContent = gamesManager.formatCompetition(game.competition);

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

function handleAnalysisSubmit(e) {
    e.preventDefault();

    if (!currentSelectedGame) return;

    const gameData = {
        homeTeam: currentSelectedGame.homeTeam,
        awayTeam: currentSelectedGame.awayTeam,
        competition: currentSelectedGame.competition,
        market: document.getElementById('marketSelect').value,
        odd: parseFloat(document.getElementById('oddInput').value),
        amount: parseFloat(document.getElementById('amountInput').value)
    };

    // Validar
    if (!gameData.market || gameData.odd < 1.01 || gameData.amount < 0.01) {
        alert('⚠️ Preencha todos os campos corretamente');
        return;
    }

    // Analisar
    const analysis = footballAnalyzer.analyze(gameData);

    if (analysis.error) {
        alert('❌ Erro na análise: ' + analysis.error);
        return;
    }

    // Exibir resultado
    displayAnalysisResult(analysis);
}

function displayAnalysisResult(analysis) {
    const resultDiv = document.getElementById('analysisResult');

    const html = `
        <div class="analysis-container">
            <div class="analysis-header">
                <h3>📊 Resultado da Análise</h3>
            </div>

            <div class="analysis-section">
                <h4>⚽ Contexto do Jogo</h4>
                <p>${analysis.context}</p>
            </div>

            <div class="analysis-section">
                <h4>📈 Forma das Equipes</h4>
                <div class="form-comparison">
                    <div class="team-form">
                        <span class="form-label">${analysis.homeTeam}:</span>
                        <span class="form-value">${analysis.form.homeForm}</span>
                    </div>
                    <div class="team-form">
                        <span class="form-label">${analysis.awayTeam}:</span>
                        <span class="form-value">${analysis.form.awayForm}</span>
                    </div>
                </div>
                <p class="form-comparison-text">${analysis.form.comparison}</p>
            </div>

            <div class="analysis-section">
                <h4>💎 Análise da Aposta</h4>
                <div class="betting-info">
                    <div class="info-item">
                        <span class="label">Mercado:</span>
                        <span class="value">${analysis.market}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Odd:</span>
                        <span class="value">${analysis.odd}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Aposta:</span>
                        <span class="value">${balanceManager.formatCurrency(analysis.amount)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Ganho Potencial:</span>
                        <span class="value gain">${balanceManager.formatCurrency(analysis.potentialGain)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ROI:</span>
                        <span class="value">${analysis.roi}%</span>
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>🎯 Grau de Risco</h4>
                <div class="risk-badge ${analysis.riskLevel}">
                    ${analysis.riskEmoji} ${analysis.riskLevel === 'LOW' ? 'BAIXO' : analysis.riskLevel === 'MEDIUM' ? 'MÉDIO' : 'ALTO'}
                </div>
            </div>

            <div class="analysis-section">
                <h4>💡 Observações Técnicas</h4>
                <ul class="observations-list">
                    ${analysis.observations.map(obs => `<li>• ${obs}</li>`).join('')}
                </ul>
            </div>

            <div class="analysis-section">
                <h4>✅ Recomendação Final</h4>
                <div class="recommendation-box ${analysis.riskLevel}">
                    ${analysis.recommendation}
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

    // Atualizar valores
    document.getElementById('totalGains').textContent = balanceManager.formatCurrency(gains);
    document.getElementById('totalLosses').textContent = balanceManager.formatCurrency(losses);
    document.getElementById('balanceValue').textContent = balanceManager.formatCurrency(balance);

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
