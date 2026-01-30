/**
 * Goals Manager - Sistema de Gerenciamento de Metas
 * Responsável por criar, editar, deletar e gerenciar metas com localStorage
 */

class GoalsManager {
    constructor(storageKey = 'userGoals') {
        this.storageKey = storageKey;
        this.goals = this.loadGoals();
    }

    /**
     * Carregar metas do localStorage
     */
    loadGoals() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao carregar metas:', error);
            return [];
        }
    }

    /**
     * Salvar metas no localStorage
     */
    saveGoals() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.goals));
        } catch (error) {
            console.error('Erro ao salvar metas:', error);
        }
    }

    /**
     * Criar nova meta
     */
    createGoal(goalData) {
        const newGoal = {
            id: Date.now().toString(),
            title: goalData.title,
            type: goalData.type,
            target: parseFloat(goalData.target),
            current: parseFloat(goalData.current),
            startDate: goalData.startDate,
            endDate: goalData.endDate,
            unit: goalData.unit || this.getDefaultUnit(goalData.type),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [
                {
                    date: new Date().toISOString(),
                    value: parseFloat(goalData.current)
                }
            ]
        };

        this.goals.push(newGoal);
        this.saveGoals();
        return newGoal;
    }

    /**
     * Atualizar meta existente
     */
    updateGoal(goalId, goalData) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index === -1) return null;

        const oldValue = this.goals[index].current;
        const newValue = parseFloat(goalData.current);

        this.goals[index] = {
            ...this.goals[index],
            title: goalData.title,
            type: goalData.type,
            target: parseFloat(goalData.target),
            current: newValue,
            startDate: goalData.startDate,
            endDate: goalData.endDate,
            unit: goalData.unit || this.getDefaultUnit(goalData.type),
            updatedAt: new Date().toISOString()
        };

        // Adicionar ao histórico apenas se o valor mudou
        if (oldValue !== newValue) {
            this.goals[index].history.push({
                date: new Date().toISOString(),
                value: newValue
            });
        }

        this.saveGoals();
        return this.goals[index];
    }

    /**
     * Atualizar apenas o valor atual (para progresso)
     */
    updateGoalProgress(goalId, newValue) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return null;

        const numValue = parseFloat(newValue);
        if (numValue !== goal.current) {
            goal.current = numValue;
            goal.updatedAt = new Date().toISOString();
            goal.history.push({
                date: new Date().toISOString(),
                value: numValue
            });
            this.saveGoals();
        }

        return goal;
    }

    /**
     * Deletar meta
     */
    deleteGoal(goalId) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index === -1) return false;

        this.goals.splice(index, 1);
        this.saveGoals();
        return true;
    }

    /**
     * Obter meta por ID
     */
    getGoal(goalId) {
        return this.goals.find(g => g.id === goalId);
    }

    /**
     * Obter todas as metas
     */
    getAllGoals() {
        return this.goals;
    }

    /**
     * Calcular progresso percentual
     */
    getProgressPercentage(goal) {
        if (goal.target === 0) return 0;
        const percentage = (goal.current / goal.target) * 100;
        return Math.min(percentage, 100);
    }

    /**
     * Calcular valor faltante
     */
    getRemainingValue(goal) {
        return Math.max(0, goal.target - goal.current);
    }

    /**
     * Calcular dias restantes
     */
    getRemainingDays(goal) {
        const today = new Date();
        const endDate = new Date(goal.endDate);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    /**
     * Obter unidade padrão baseado no tipo
     */
    getDefaultUnit(type) {
        const units = {
            money: 'R$',
            percentage: '%',
            tasks: 'tarefas',
            custom: ''
        };
        return units[type] || '';
    }

    /**
     * Formatador de valor baseado no tipo
     */
    formatValue(goal) {
        const { type, current, unit } = goal;

        if (type === 'money') {
            return `R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        } else if (type === 'percentage') {
            return `${current.toFixed(2)}%`;
        } else if (type === 'tasks') {
            return `${Math.round(current)} tarefas`;
        } else {
            return `${current.toFixed(2)} ${unit}`;
        }
    }

    /**
     * Formatador de meta baseado no tipo
     */
    formatTarget(goal) {
        const { type, target, unit } = goal;

        if (type === 'money') {
            return `R$ ${target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        } else if (type === 'percentage') {
            return `${target.toFixed(2)}%`;
        } else if (type === 'tasks') {
            return `${Math.round(target)} tarefas`;
        } else {
            return `${target.toFixed(2)} ${unit}`;
        }
    }

    /**
     * Obter label para valor faltante
     */
    getRemainLabel(goal) {
        const { type, target, current } = goal;
        const remaining = target - current;

        if (type === 'money') {
            return `R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        } else if (type === 'percentage') {
            return `${remaining.toFixed(2)}%`;
        } else if (type === 'tasks') {
            return `${Math.round(remaining)} tarefas`;
        } else {
            return `${remaining.toFixed(2)}`;
        }
    }

    /**
     * Obter estatísticas da meta
     */
    getGoalStats(goal) {
        return {
            percentage: this.getProgressPercentage(goal),
            remaining: this.getRemainingValue(goal),
            remainingDays: this.getRemainingDays(goal),
            isCompleted: goal.current >= goal.target,
            progress: goal.current,
            target: goal.target
        };
    }

    /**
     * Validar dados da meta
     */
    validateGoal(goalData) {
        const errors = [];

        if (!goalData.title || goalData.title.trim() === '') {
            errors.push('Título é obrigatório');
        }

        if (!goalData.type || goalData.type === '') {
            errors.push('Tipo de meta é obrigatório');
        }

        if (!goalData.target || goalData.target <= 0) {
            errors.push('Valor alvo deve ser maior que 0');
        }

        if (goalData.current < 0) {
            errors.push('Valor atual não pode ser negativo');
        }

        if (!goalData.startDate) {
            errors.push('Data inicial é obrigatória');
        }

        if (!goalData.endDate) {
            errors.push('Data final é obrigatória');
        }

        if (goalData.startDate >= goalData.endDate) {
            errors.push('Data final deve ser posterior à data inicial');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Exportar metas em JSON
     */
    exportGoals() {
        return JSON.stringify(this.goals, null, 2);
    }

    /**
     * Importar metas de JSON
     */
    importGoals(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                this.goals = imported;
                this.saveGoals();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao importar metas:', error);
            return false;
        }
    }

    /**
     * Limpar todas as metas (cuidado!)
     */
    clearAllGoals() {
        this.goals = [];
        this.saveGoals();
    }

    /**
     * Obter metas ordenadas por progresso
     */
    getGoalsSortedByProgress() {
        return [...this.goals].sort((a, b) => {
            const percentA = this.getProgressPercentage(a);
            const percentB = this.getProgressPercentage(b);
            return percentB - percentA;
        });
    }

    /**
     * Obter metas ordenadas por prazo
     */
    getGoalsSortedByDeadline() {
        return [...this.goals].sort((a, b) => {
            return new Date(a.endDate) - new Date(b.endDate);
        });
    }
}

// Exportar para uso global
window.GoalsManager = GoalsManager;
