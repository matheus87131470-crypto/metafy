/**
 * app.js - Script Principal da Plataforma Football AI
 * Integração com APIs reais de jogos e IA
 * Versão: 2.1.0 (MVP com IA de Análise)
 * Build: 2026-01-31T00:00:00Z
 */

let balanceManager;
let aiAnalyzer;
let currentSelectedGame = null;
let gamesCache = null;
let isLoadingAnalysis = false;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar
    balanceManager = new BalanceManager();
    aiAnalyzer = new AIAnalyzer();

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
    const notes = document.getElementById('notesInput')?.value || '';

    // Validar
    if (!market || odd < 1.01 || amount < 0.01) {
        alert('⚠️ Preencha todos os campos corretamente');
        return;
    }

    isLoadingAnalysis = true;
    const analyzeBtn = document.querySelector('#analysisForm button');
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '⏳ Analisando com IA Real...';
    analyzeBtn.disabled = true;

    const resultDiv = document.getElementById('analysisResult');
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 2.5rem; margin-bottom: 15px; animation: pulse 1.5s infinite;">🤖</div>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Conectando com IA Real...</p>
            <p style="color: var(--text-tertiary); font-size: 0.9rem; margin-top: 10px;">Isso pode levar alguns segundos</p>
        </div>
    `;
    resultDiv.style.display = 'block';

    try {
        // Chamar IA Real com os dados
        const analysis = await aiAnalyzer.analyzeGame(
            currentSelectedGame,
            market,
            odd,
            amount,
            notes
        );

        // Renderizar resultado
        displayAnalysisResult(analysis, {
            homeTeam: currentSelectedGame.homeTeam,
            awayTeam: currentSelectedGame.awayTeam,
            competition: currentSelectedGame.competition,
            market,
            odd,
            amount
        });

    } catch (error) {
        console.error('Erro na análise:', error);
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 2.5rem; margin-bottom: 15px;">⚠️</div>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">Erro ao conectar com IA</p>
                <p style="color: var(--text-tertiary); font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
                <button class="btn-primary" style="margin-top: 20px;" onclick="document.getElementById('analysisResult').style.display = 'none';">
                    Fechar
                </button>
            </div>
        `;
    } finally {
        isLoadingAnalysis = false;
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
}

function displayAnalysisResult(analysis, gameData) {
    const resultDiv = document.getElementById('analysisResult');
    
    // Renderizar baseado no tipo de análise (IA Real ou Fallback)
    const isRealAI = analysis.source === 'api';
    const html = isRealAI ? formatRealAIAnalysis(analysis, gameData) : formatFallbackAnalysis(analysis, gameData);

    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    
    // Scroll para o resultado
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function formatRealAIAnalysis(analysis, gameData) {
    return `
        <div class="analysis-container">
            <div class="analysis-header">
                <h3>🤖 Análise com IA Real OpenAI</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted);">GPT-4o-mini • Análise Profissional</p>
            </div>

            <div class="analysis-section">
                <h4>⚽ Jogo</h4>
                <div style="background: rgba(99, 102, 241, 0.08); padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">
                    <p style="font-weight: bold; font-size: 1.1rem; margin: 0;">
                        ${analysis.gameInfo.home} <span style="color: var(--text-muted);">vs</span> ${analysis.gameInfo.away}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">
                        ${analysis.gameInfo.competition} • ${analysis.gameInfo.market}
                    </p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>🧠 Análise da IA</h4>
                <div style="background: rgba(236, 72, 153, 0.05); padding: 16px; border-radius: 8px; border-left: 4px solid #ec4899; max-height: 400px; overflow-y: auto;">
                    <div style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
                        ${escapeHtml(analysis.rawAnalysis)}
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>💰 Informações da Aposta</h4>
                <div class="betting-info">
                    <div class="info-item">
                        <span class="label">Mercado:</span>
                        <span class="value">${gameData.market}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Odd:</span>
                        <span class="value" style="font-weight: bold; color: #6366f1;">${gameData.odd.toFixed(2)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Aposta:</span>
                        <span class="value">${balanceManager.formatCurrency(gameData.amount)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Ganho Potencial:</span>
                        <span class="value gain" style="font-weight: bold;">${balanceManager.formatCurrency(analysis.potentialGain)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ROI:</span>
                        <span class="value">${analysis.roi}%</span>
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>⚖️ Aviso Legal</h4>
                <div style="background: rgba(245, 158, 11, 0.08); padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b; font-size: 0.85rem; color: var(--text-secondary);">
                    <p style="margin: 0;">
                        ⚠️ Esta análise é fornecida para fins informativos. Apostas envolvem riscos.
                        Nunca aposte mais do que pode perder. Consulte um especialista se necessário.
                    </p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
                <button class="btn-primary" onclick="registerBetFromAnalysis()" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                    ✅ Registrar Aposta
                </button>
                <button class="btn-secondary" onclick="closeGameModal()" style="border: 1px solid rgba(99, 102, 241, 0.3); background: transparent; color: #6366f1;">
                    ❌ Fechar
                </button>
            </div>

            <div style="margin-top: 16px; padding: 12px; background: rgba(20, 184, 166, 0.05); border-radius: 8px; text-align: center; font-size: 0.8rem; color: var(--text-tertiary);">
                Análise gerada em ${new Date(analysis.timestamp).toLocaleTimeString('pt-BR')}
            </div>
        </div>
    `;
}

function formatFallbackAnalysis(analysis, gameData) {
    return `
        <div class="analysis-container">
            <div class="analysis-header">
                <h3>⚠️ Análise Local (Fallback)</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted);">IA Real indisponível • Usando dados locais</p>
            </div>

            <div class="analysis-section">
                <h4>ℹ️ Informações</h4>
                <div style="background: rgba(245, 158, 11, 0.08); padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                        A IA em produção não está disponível no momento. 
                        <br/><br/>
                        <strong>Para usar a IA real:</strong>
                        <br/>
                        1. Certifique-se que o backend está rodando
                        <br/>
                        2. Configure a chave OpenAI no arquivo .env
                        <br/>
                        3. Recarregue a página
                    </p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>⚽ Jogo</h4>
                <div style="background: rgba(99, 102, 241, 0.08); padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">
                    <p style="font-weight: bold; font-size: 1.1rem; margin: 0;">
                        ${analysis.gameInfo.home} <span style="color: var(--text-muted);">vs</span> ${analysis.gameInfo.away}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: var(--text-secondary);">
                        ${analysis.gameInfo.competition} • ${analysis.gameInfo.market}
                    </p>
                </div>
            </div>

            <div class="analysis-section">
                <h4>📊 Análise Local</h4>
                <div style="background: rgba(236, 72, 153, 0.05); padding: 16px; border-radius: 8px; border-left: 4px solid #ec4899;">
                    <div style="color: var(--text-primary); font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
                        ${escapeHtml(analysis.rawAnalysis)}
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>💰 Informações da Aposta</h4>
                <div class="betting-info">
                    <div class="info-item">
                        <span class="label">Mercado:</span>
                        <span class="value">${gameData.market}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Odd:</span>
                        <span class="value" style="font-weight: bold; color: #6366f1;">${gameData.odd.toFixed(2)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Aposta:</span>
                        <span class="value">${balanceManager.formatCurrency(gameData.amount)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Ganho Potencial:</span>
                        <span class="value gain" style="font-weight: bold;">${balanceManager.formatCurrency(analysis.potentialGain)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ROI:</span>
                        <span class="value">${analysis.roi}%</span>
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>⚖️ Aviso Legal</h4>
                <div style="background: rgba(245, 158, 11, 0.08); padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b; font-size: 0.85rem; color: var(--text-secondary);">
                    <p style="margin: 0;">
                        ⚠️ Esta é uma análise local de demonstração. Apostas envolvem riscos.
                        Nunca aposte mais do que pode perder. Consulte um especialista se necessário.
                    </p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
                <button class="btn-primary" onclick="registerBetFromAnalysis()" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                    ✅ Registrar Aposta
                </button>
                <button class="btn-secondary" onclick="closeGameModal()" style="border: 1px solid rgba(99, 102, 241, 0.3); background: transparent; color: #6366f1;">
                    ❌ Fechar
                </button>
            </div>
        </div>
    `;
}

/**
 * Escape HTML para evitar XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function registerBetFromAnalysis() {
    const oddInput = document.getElementById('oddInput');
    const amountInput = document.getElementById('amountInput');
    
    const odd = parseFloat(oddInput.value);
    const amount = parseFloat(amountInput.value);
    
    if (odd && amount) {
        const potentialGain = (amount * odd) - amount;
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

function formatLocalAnalysis(analysis) {
    const riskColor = {
        'BAIXO': '#14b8a6',
        'MÉDIO': '#f59e0b',
        'ALTO': '#ef4444'
    }[analysis.riskLevel] || '#14b8a6';

    return `
        <div class="analysis-container">
            <div class="analysis-header">
                <h3>🤖 Análise com IA</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Análise Inteligente em Tempo Real</p>
            </div>

            <div class="analysis-section">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div style="background: rgba(20, 184, 166, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #14b8a6;">
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Probabilidade</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #14b8a6;">${Math.round(analysis.probability * 100)}%</div>
                    </div>
                    <div style="background: rgba(${analysis.riskLevel === 'BAIXO' ? '20, 184, 166' : analysis.riskLevel === 'MÉDIO' ? '245, 158, 11' : '239, 68, 68'}, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid ${riskColor};">
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Risco</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: ${riskColor};">${analysis.riskLevel}</div>
                    </div>
                </div>

                <div style="background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid rgba(99, 102, 241, 0.2);">
                    <div style="font-weight: bold; color: #6366f1; margin-bottom: 8px;">💡 Sugestão</div>
                    <div style="color: var(--text-primary); font-size: 0.95rem;">${analysis.suggestion}</div>
                </div>

                <div style="background: rgba(236, 72, 153, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: bold; color: var(--text-primary); margin-bottom: 8px;">📋 Análise</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap;">${analysis.explanation.trim()}</div>
                </div>

                <div style="background: rgba(34, 197, 94, 0.05); padding: 12px; border-radius: 8px;">
                    <div style="font-weight: bold; color: var(--text-primary); margin-bottom: 8px;">✅ Recomendações</div>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${analysis.recommendations.map(rec => `<li style="color: var(--text-secondary); font-size: 0.9rem; padding: 4px 0;">${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <button class="btn-register-bet" onclick="registerBetFromAnalysis(${analysis.confidence}, ${analysis.potentialGain})">
                ✅ Registrar Aposta
            </button>
        </div>
    `;
}

function formatAPIAnalysis(analysis) {
    // Para respostas da API (formato anterior)
    return `
        <div class="analysis-container">
            <div class="analysis-header">
                <h3>📊 Análise com IA Real</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Gerada por Inteligência Artificial</p>
            </div>

            <div class="analysis-section">
                <div style="background: rgba(99, 102, 241, 0.1); padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1; margin-bottom: 12px;">
                    <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">🔍 Contexto</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${analysis.contexto || 'Análise detalhada do confronto'}</p>
                </div>

                <div style="background: rgba(236, 72, 153, 0.1); padding: 16px; border-radius: 8px; border-left: 4px solid #ec4899; margin-bottom: 12px;">
                    <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">📊 Forma dos Times</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${analysis.forma || 'Análise de performance recente'}</p>
                </div>

                <button class="btn-register-bet" onclick="registerBetFromAnalysis()">
                    ✅ Registrar Aposta
                </button>
            </div>
        </div>
    `;
}
