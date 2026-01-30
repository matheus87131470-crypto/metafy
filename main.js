/**
 * Script Principal - Plataforma de Análise de Futebol
 */

let goalsManager;
let footballAnalyzer;
let balanceManager;
let gaugesMap = new Map();
let currentEditingGoalId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas
    goalsManager = new GoalsManager();
    footballAnalyzer = new FootballAnalyzer();
    balanceManager = new BalanceManager();

    // Inicializar data padrão para formulário
    setDefaultDates();

    // Setup eventos
    setupEventListeners();
    setupTabNavigation();
    setupFootballAnalysisForm();
    setupBalanceControls();

    // Renderizar metas
    renderGoals();
    renderBalanceStats();

    // Atualizar timestamp
    updateTime();
    setInterval(updateTime, 1000);

    // Responsividade
    window.addEventListener('resize', debounce(handleResize, 300));
});

// ====================================
// SETUP DE EVENTOS
// ====================================

function setupEventListeners() {
    const btnCreateGoal = document.getElementById('btnCreateGoal');
    const modalClose = document.getElementById('modalClose');
    const btnCancel = document.getElementById('btnCancel');
    const btnDelete = document.getElementById('btnDelete');
    const goalForm = document.getElementById('goalForm');
    const goalModal = document.getElementById('goalModal');
    const goalType = document.getElementById('goalType');
    const customUnitGroup = document.getElementById('customUnitGroup');

    // Abrir modal para criar nova meta
    btnCreateGoal.addEventListener('click', openModal);

    // Fechar modal
    modalClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Fechar modal ao clicar fora
    goalModal.addEventListener('click', (e) => {
        if (e.target === goalModal) closeModal();
    });

    // Mostrar/esconder unidade customizada
    goalType.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customUnitGroup.style.display = 'block';
        } else {
            customUnitGroup.style.display = 'none';
        }
    });

    // Enviar formulário
    goalForm.addEventListener('submit', handleFormSubmit);

    // Deletar meta
    btnDelete.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('🗑️ Tem certeza que deseja deletar esta meta?')) {
            goalsManager.deleteGoal(currentEditingGoalId);
            notifications.success('Meta deletada com sucesso!');
            closeModal();
            renderGoals();
        }
    });
}

// ====================================
// MODAL FUNCTIONS
// ====================================

function openModal(goalId = null) {
    const modal = document.getElementById('goalModal');
    const modalTitle = document.getElementById('modalTitle');
    const goalForm = document.getElementById('goalForm');
    const btnDelete = document.getElementById('btnDelete');

    // Resetar formulário
    goalForm.reset();

    if (goalId) {
        // Modo edição
        currentEditingGoalId = goalId;
        const goal = goalsManager.getGoal(goalId);

        modalTitle.textContent = 'Editar Meta';
        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalType').value = goal.type;
        document.getElementById('goalTarget').value = goal.target;
        document.getElementById('goalCurrent').value = goal.current;
        document.getElementById('goalStartDate').value = goal.startDate;
        document.getElementById('goalEndDate').value = goal.endDate;
        document.getElementById('goalUnit').value = goal.unit;

        // Mostrar/esconder unidade customizada
        if (goal.type === 'custom') {
            document.getElementById('customUnitGroup').style.display = 'block';
        }

        btnDelete.style.display = 'block';
    } else {
        // Modo criação
        currentEditingGoalId = null;
        modalTitle.textContent = 'Criar Nova Meta';
        btnDelete.style.display = 'none';
        document.getElementById('customUnitGroup').style.display = 'none';
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('goalModal');
    const goalForm = document.getElementById('goalForm');

    modal.classList.remove('active');
    goalForm.reset();
    currentEditingGoalId = null;
}

// ====================================
// FORM HANDLING
// ====================================

function handleFormSubmit(e) {
    e.preventDefault();

    const goalData = {
        title: document.getElementById('goalTitle').value.trim(),
        type: document.getElementById('goalType').value,
        target: document.getElementById('goalTarget').value,
        current: document.getElementById('goalCurrent').value,
        startDate: document.getElementById('goalStartDate').value,
        endDate: document.getElementById('goalEndDate').value,
        unit: document.getElementById('goalUnit').value.trim()
    };

    // Validação customizada
    const validation = goalsManager.validateGoal(goalData);
    if (!validation.isValid) {
        notifications.error('⚠️ ' + validation.errors[0]);
        return;
    }

    // Mostrar loading no botão
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Salvando...';

    // Simular delay para feedback visual
    setTimeout(() => {
        if (currentEditingGoalId) {
            // Atualizar meta existente
            goalsManager.updateGoal(currentEditingGoalId, goalData);
            notifications.success('✨ Meta atualizada com sucesso!');
        } else {
            // Criar nova meta
            goalsManager.createGoal(goalData);
            notifications.success('🎯 Meta criada com sucesso!');
        }

        // Restaurar botão
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        closeModal();
        renderGoals();
    }, 800);
}

// ====================================
// RENDERIZAÇÃO DE METAS
// ====================================

function renderGoals() {
    const mainContent = document.getElementById('mainContent');
    const emptyState = document.getElementById('emptyState');
    const goals = goalsManager.getAllGoals();

    if (goals.length === 0) {
        mainContent.innerHTML = emptyState.outerHTML;
        return;
    }

    // Remover empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // Limpar e renderizar cards
    mainContent.innerHTML = '';
    mainContent.style.display = 'grid';

    goals.forEach((goal, index) => {
        const card = createGaugeCard(goal, index);
        mainContent.appendChild(card);
    });
}

function createGaugeCard(goal, index) {
    const stats = goalsManager.getGoalStats(goal);
    const canvasId = `gaugeCanvas_${goal.id}`;

    const card = document.createElement('div');
    card.className = 'gauge-card';
    card.innerHTML = `
        <div class="gauge-header">
            <h2 class="gauge-title">${goal.title}</h2>
            <span class="gauge-period">${formatDateRange(goal.startDate, goal.endDate)}</span>
        </div>

        <div class="gauge-container">
            <canvas id="${canvasId}" class="gauge-canvas"></canvas>
            
            <div class="gauge-content">
                <div class="gauge-value">
                    <span class="value-amount">${goalsManager.formatValue(goal)}</span>
                    <span class="value-currency">de ${goalsManager.formatTarget(goal)}</span>
                </div>
                <div class="gauge-percentage">
                    <span class="percentage-number">${stats.percentage.toFixed(1)}%</span>
                </div>
            </div>
        </div>

        <div class="gauge-footer">
            <div class="footer-stat">
                <span class="stat-label">Meta</span>
                <span class="stat-value">${goalsManager.formatTarget(goal)}</span>
            </div>
            <div class="footer-stat">
                <span class="stat-label">Faltam</span>
                <span class="stat-value">${goalsManager.getRemainLabel(goal)}</span>
            </div>
            <div class="footer-stat">
                <span class="stat-label">Prazo</span>
                <span class="stat-value">${stats.remainingDays} dias</span>
            </div>
        </div>

        <div class="gauge-card-actions">
            <button class="btn-small edit" data-id="${goal.id}">✏️ Editar</button>
            <button class="btn-small delete" data-id="${goal.id}">🗑️ Deletar</button>
        </div>
    `;

    // Adicionar eventos dos botões
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');

    editBtn.addEventListener('click', () => openModal(goal.id));
    deleteBtn.addEventListener('click', () => {
        if (confirm('🗑️ Tem certeza que deseja deletar esta meta?')) {
            goalsManager.deleteGoal(goal.id);
            notifications.success('Meta deletada com sucesso!');
            renderGoals();
        }
    });

    // Inicializar gauge após a card ser adicionada ao DOM
    setTimeout(() => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const gauge = new SemiCircularGauge(canvasId, {
                percentage: 0,
                targetPercentage: stats.percentage,
                radius: 70,
                strokeWidth: 8,
                duration: 2000,
                progressColor: '#6366f1'
            });

            gaugesMap.set(goal.id, gauge);

            // Re-animar ao hover em desktop
            if (window.matchMedia('(hover: hover)').matches) {
                card.addEventListener('mouseenter', () => {
                    const savedPercentage = gauge.options.percentage;
                    gauge.startTime = null;
                    gauge.options.percentage = Math.max(0, savedPercentage - 5);
                    gauge.animate();
                });
            }
        }
    }, 0);

    return card;
}

// ====================================
// UTILITÁRIOS
// ====================================

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    document.getElementById('goalStartDate').value = today;
    document.getElementById('goalEndDate').value = future;
}

function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const month = end.toLocaleString('pt-BR', { month: 'short' });
    const year = end.getFullYear();
    return `${month}/${year}`;
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    document.getElementById('updateTime').textContent = `${hours}:${minutes}`;
}

function handleResize() {
    // Re-renderizar gauges em caso de redimensionamento
    gaugesMap.forEach((gauge) => {
        gauge.setupCanvas();
        gauge.render(gauge.options.percentage);
    });
}

// ====================================
// FUNCTIONS PÚBLICAS PARA ATUALIZAR PROGRESSO
// ====================================

/**
 * Atualizar progresso de uma meta
 * updateGoalProgress('goalId', 50);
 */
window.updateGoalProgress = function (goalId, newValue) {
    const goal = goalsManager.updateGoalProgress(goalId, newValue);
    if (goal) {
        const stats = goalsManager.getGoalStats(goal);
        const gauge = gaugesMap.get(goalId);
        if (gauge) {
            gauge.updatePercentage(stats.percentage);
        }
    }
};

/**
 * Obter dados de uma meta
 * const goal = getGoal('goalId');
 */
window.getGoal = function (goalId) {
    return goalsManager.getGoal(goalId);
};

/**
 * Obter todas as metas
 * const goals = getAllGoals();
 */
window.getAllGoals = function () {
    return goalsManager.getAllGoals();
};

/**
 * Exportar metas
 */
window.exportGoals = function () {
    const json = goalsManager.exportGoals();
    console.log('Metas exportadas (copie para um arquivo JSON):');
    console.log(json);
    return json;
};

/**
 * Importar metas
 */
window.importGoals = function (jsonData) {
    const success = goalsManager.importGoals(jsonData);
    if (success) {
        renderGoals();
        console.log('Metas importadas com sucesso!');
    }
    return success;
};
// ====================================
// SISTEMA DE ABAS (NAVEGAÇÃO)
// ====================================

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adicionar classe active ao botão e conteúdo clicado
            button.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Trigger de eventos quando abrir tabs específicas
            if (tabName === 'ganhos') {
                renderBalanceStats();
            }
        });
    });

    // Ativar primeira aba por padrão
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
    }
}

// ====================================
// ANÁLISE DE FUTEBOL (IA MOCK)
// ====================================

function setupFootballAnalysisForm() {
    const gameForm = document.getElementById('gameForm');
    const analyzeBtn = document.getElementById('analyzeBtn');

    if (gameForm && analyzeBtn) {
        gameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFootballAnalysis();
        });
    }
}

function handleFootballAnalysis() {
    const gameForm = document.getElementById('gameForm');
    if (!gameForm) return;

    const gameData = {
        home: document.getElementById('homeTeam')?.value || '',
        away: document.getElementById('awayTeam')?.value || '',
        competition: document.getElementById('competition')?.value || '',
        market: document.getElementById('market')?.value || '',
        odd: document.getElementById('gameOdd')?.value || '',
        amount: document.getElementById('gameAmount')?.value || ''
    };

    // Validar
    const errors = footballAnalyzer.validateGameData(gameData);
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
    }

    // Analisar
    const analysis = footballAnalyzer.analyze(gameData);

    if (analysis.error) {
        showNotification(analysis.error, 'error');
        return;
    }

    // Renderizar resultado
    renderFootballAnalysis(analysis);
    showNotification('✓ Análise gerada com sucesso!', 'success');
}

function renderFootballAnalysis(analysis) {
    const resultDiv = document.getElementById('analysisResult');
    if (!resultDiv) return;

    const riskColor = analysis.riskLevel.value;
    const formAnalysis = analysis.formAnalysis;

    resultDiv.innerHTML = `
        <div class="analysis-card" style="animation: slideUp 0.3s ease;">
            <div class="analysis-header">
                <h3>⚽ ${analysis.homeTeam} vs ${analysis.awayTeam}</h3>
                <span class="risk-badge ${riskColor}">
                    ${analysis.riskLevel.emoji} ${analysis.riskLevel.label}
                </span>
            </div>
            
            <div class="analysis-body">
                <!-- Informações do Jogo -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div class="analysis-section">
                        <h4>🏆 Competição</h4>
                        <p class="analysis-text">${analysis.competition}</p>
                    </div>
                    <div class="analysis-section">
                        <h4>📊 Mercado</h4>
                        <p class="analysis-text">${analysis.market}</p>
                    </div>
                </div>

                <!-- Forma dos Times -->
                <div class="analysis-section">
                    <h4>📈 Forma Recente dos Times</h4>
                    <div style="background: rgba(99, 102, 241, 0.05); border-radius: 10px; padding: 12px; margin-top: 8px;">
                        <p style="margin: 6px 0; color: var(--text-secondary);">
                            <strong>${formAnalysis.home.team}:</strong> ${formAnalysis.home.description}
                        </p>
                        <p style="margin: 6px 0; color: var(--text-secondary);">
                            <strong>${formAnalysis.away.team}:</strong> ${formAnalysis.away.description}
                        </p>
                        <p style="margin: 6px 0; color: var(--accent-color); font-weight: 500;">
                            → ${formAnalysis.comparison}
                        </p>
                    </div>
                </div>

                <!-- Financeiro -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0;">
                    <div class="analysis-section">
                        <h4>Odd</h4>
                        <p class="analysis-value">${analysis.odd.toFixed(2)}</p>
                    </div>
                    <div class="analysis-section">
                        <h4>Valor</h4>
                        <p class="analysis-value">R$ ${parseFloat(analysis.amount).toFixed(2)}</p>
                    </div>
                    <div class="analysis-section">
                        <h4>Lucro Potencial</h4>
                        <p class="analysis-value" style="color: var(--accent-color);">
                            R$ ${parseFloat(analysis.netProfit).toFixed(2)}
                        </p>
                    </div>
                </div>

                <!-- ROI -->
                <div class="analysis-section">
                    <h4>💰 Retorno Esperado</h4>
                    <p class="analysis-value">${analysis.roi}% ROI</p>
                </div>

                <!-- Contexto do Jogo -->
                <div class="analysis-section">
                    <h4>🎯 Contexto da Partida</h4>
                    <p class="analysis-text" style="margin-top: 8px;">
                        <strong>Importância:</strong> ${analysis.gameContext.importance}<br>
                        <strong>Nível:</strong> ${analysis.gameContext.level}<br>
                        <strong>Detalhes:</strong> ${analysis.gameContext.details}
                    </p>
                </div>

                <!-- Estratégia -->
                <div class="analysis-section">
                    <h4>💡 Estratégia Recomendada</h4>
                    <p class="analysis-text">${analysis.strategy}</p>
                </div>

                <!-- Recomendação Final -->
                <div class="analysis-section" style="background: rgba(99, 102, 241, 0.1); border-radius: 10px; padding: 14px; border-left: 4px solid var(--primary-color);">
                    <h4>✅ Recomendação Final</h4>
                    <p class="analysis-text" style="margin-top: 6px; font-weight: 500; color: var(--primary-color);">
                        ${analysis.recommendation}
                    </p>
                </div>

                <!-- Observações -->
                <div class="analysis-section">
                    <h4>⚠️ Observações Importantes</h4>
                    <ul class="analysis-list">
                        ${analysis.observations.map(obs => `<li>${obs}</li>`).join('')}
                    </ul>
                </div>

                <!-- Disclaimer -->
                <div class="warning-box">
                    <strong>⚖️ Aviso Legal:</strong> Esta análise é simulada com base em algoritmos. 
                    Futebol é imprevisível - mesmo análises excelentes têm taxa de acerto de 55-60%.
                    Nunca aposte dinheiro que não pode perder. Jogue com responsabilidade.
                </div>
            </div>
        </div>
    `;
    
    resultDiv.style.display = 'block';
}

// ====================================
// CONTROLE DE GANHOS E PERDAS
// ====================================

function setupBalanceControls() {
    const addGainBtn = document.getElementById('addGainBtn');
    const addLossBtn = document.getElementById('addLossBtn');
    const gainInput = document.getElementById('gainAmount');
    const lossInput = document.getElementById('lossAmount');

    if (addGainBtn) {
        addGainBtn.addEventListener('click', () => {
            const amount = gainInput?.value;
            if (!amount || parseFloat(amount) <= 0) {
                showNotification('Digite um valor válido', 'error');
                return;
            }

            try {
                balanceManager.addGain(parseFloat(amount), 'Ganho registrado');
                renderBalanceStats();
                gainInput.value = '';
                showNotification(`✓ Ganho de R$ ${parseFloat(amount).toFixed(2)} registrado!`, 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    if (addLossBtn) {
        addLossBtn.addEventListener('click', () => {
            const amount = lossInput?.value;
            if (!amount || parseFloat(amount) <= 0) {
                showNotification('Digite um valor válido', 'error');
                return;
            }

            try {
                balanceManager.addLoss(parseFloat(amount), 'Perda registrada');
                renderBalanceStats();
                lossInput.value = '';
                showNotification(`✗ Perda de R$ ${parseFloat(amount).toFixed(2)} registrada!`, 'error');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Permitir Enter para enviar
    gainInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGainBtn?.click();
    });

    lossInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addLossBtn?.click();
    });
}

function renderBalanceStats() {
    const stats = balanceManager.getStatistics();
    const proportions = balanceManager.getBarProportions();

    // Atualizar cards de estatísticas
    const gainCard = document.getElementById('totalGain');
    if (gainCard) {
        gainCard.textContent = `R$ ${parseFloat(stats.totalGains).toFixed(2).replace('.', ',')}`;
    }

    const lossCard = document.getElementById('totalLoss');
    if (lossCard) {
        lossCard.textContent = `-R$ ${parseFloat(stats.totalLoss).toFixed(2).replace('.', ',')}`;
    }

    const balanceCard = document.getElementById('balance');
    if (balanceCard) {
        const balanceValue = parseFloat(stats.balance);
        const prefix = balanceValue >= 0 ? '+' : '';
        balanceCard.textContent = `${prefix}R$ ${Math.abs(balanceValue).toFixed(2).replace('.', ',')}`;
        balanceCard.className = balanceValue >= 0 ? 'stat-value balance' : 'stat-value balance loss';
    }

    // Atualizar barra visual
    const balanceBar = document.querySelector('.balance-bar');
    if (balanceBar) {
        balanceBar.innerHTML = '';

        if (proportions.gainPercent > 0) {
            const gainFill = document.createElement('div');
            gainFill.className = 'balance-bar-fill gain-fill';
            gainFill.style.width = `${proportions.gainPercent}%`;
            gainFill.textContent = `${proportions.gainPercent}%`;
            balanceBar.appendChild(gainFill);
        }

        if (proportions.lossPercent > 0) {
            const lossFill = document.createElement('div');
            lossFill.className = 'balance-bar-fill loss-fill';
            lossFill.style.width = `${proportions.lossPercent}%`;
            lossFill.textContent = `${proportions.lossPercent}%`;
            balanceBar.appendChild(lossFill);
        }

        if (proportions.gainPercent === 0 && proportions.lossPercent === 0) {
            balanceBar.innerHTML = '<div style="width: 100%; color: var(--text-muted); text-align: center;">Sem dados</div>';
        }
    }

    // Renderizar histórico
    renderBalanceHistory();
}

function renderBalanceHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    const transactions = balanceManager.getAllTransactions(20);

    if (transactions.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Nenhuma transação registrada ainda</div>';
        return;
    }

    historyList.innerHTML = transactions.map(trans => `
        <div class="history-item">
            <div class="history-item-type">
                <div class="history-item-label">
                    ${trans.type === 'gain' ? '✓ Ganho' : '✗ Perda'}
                </div>
                <div class="history-item-time">
                    ${BalanceManager.formatDateTime(trans.timestamp)}
                </div>
            </div>
            <div class="history-item-value ${trans.type}">
                ${trans.type === 'gain' ? '+' : '-'}R$ ${trans.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}