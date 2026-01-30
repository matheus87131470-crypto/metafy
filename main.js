/**
 * Script Principal - Dashboard Dinâmico de Metas
 */

let goalsManager;
let gaugesMap = new Map();
let currentEditingGoalId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de metas
    goalsManager = new GoalsManager();

    // Inicializar data padrão para formulário
    setDefaultDates();

    // Setup eventos
    setupEventListeners();

    // Renderizar metas
    renderGoals();

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
