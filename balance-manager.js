/**
 * SISTEMA DE CONTROLE DE GANHOS E PERDAS
 * Gerencia histórico financeiro e estatísticas
 * Utiliza localStorage para persistência
 */

class BalanceManager {
    constructor(storageKey = 'userBalance') {
        this.storageKey = storageKey;
        this.init();
    }

    /**
     * Inicializa o gerenciador
     */
    init() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) {
            this.data = {
                transactions: [],
                startingBalance: 0,
                createdAt: new Date().toISOString()
            };
            this.save();
        }
    }

    /**
     * Adiciona um ganho
     * @param {number} amount - Valor do ganho
     * @param {string} description - Descrição (opcional)
     * @returns {Object} Transação criada
     */
    addGain(amount, description = 'Ganho') {
        return this.addTransaction('gain', amount, description);
    }

    /**
     * Adiciona uma perda
     * @param {number} amount - Valor da perda
     * @param {string} description - Descrição (opcional)
     * @returns {Object} Transação criada
     */
    addLoss(amount, description = 'Perda') {
        return this.addTransaction('loss', amount, description);
    }

    /**
     * Adiciona uma transação genérica
     */
    addTransaction(type, amount, description) {
        const amountNum = parseFloat(amount);

        if (amountNum <= 0) {
            throw new Error('Valor deve ser maior que zero');
        }

        if (!description?.trim()) {
            description = type === 'gain' ? 'Ganho' : 'Perda';
        }

        const transaction = {
            id: this.generateId(),
            type: type, // 'gain' ou 'loss'
            amount: amountNum,
            description: description.substring(0, 100),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR')
        };

        this.data.transactions.push(transaction);
        this.save();

        return transaction;
    }

    /**
     * Remove uma transação
     */
    removeTransaction(id) {
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.data.transactions.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Obtém estatísticas consolidadas
     */
    getStatistics() {
        const transactions = this.data.transactions;

        const totalGains = transactions
            .filter(t => t.type === 'gain')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalLoss = transactions
            .filter(t => t.type === 'loss')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalGains - totalLoss;
        const transactionCount = transactions.length;
        const gainCount = transactions.filter(t => t.type === 'gain').length;
        const lossCount = transactions.filter(t => t.type === 'loss').length;

        const roi = totalGains > 0 
            ? (((balance) / (totalGains + totalLoss)) * 100).toFixed(2)
            : 0;

        return {
            totalGains: totalGains.toFixed(2),
            totalLoss: totalLoss.toFixed(2),
            balance: balance.toFixed(2),
            roi: roi,
            transactionCount: transactionCount,
            gainCount: gainCount,
            lossCount: lossCount,
            avgGain: gainCount > 0 ? (totalGains / gainCount).toFixed(2) : 0,
            avgLoss: lossCount > 0 ? (totalLoss / lossCount).toFixed(2) : 0
        };
    }

    /**
     * Obtém todas as transações
     */
    getAllTransactions(limit = 50) {
        return this.data.transactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * Calcula proporção gain/loss para barra visual
     */
    getBarProportions() {
        const stats = this.getStatistics();
        const totalGains = parseFloat(stats.totalGains);
        const totalLoss = parseFloat(stats.totalLoss);
        const total = totalGains + totalLoss;

        if (total === 0) {
            return { gainPercent: 0, lossPercent: 0 };
        }

        return {
            gainPercent: ((totalGains / total) * 100).toFixed(1),
            lossPercent: ((totalLoss / total) * 100).toFixed(1)
        };
    }

    /**
     * Reseta todas as transações
     */
    reset() {
        if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação é irreversível.')) {
            this.data = {
                transactions: [],
                startingBalance: 0,
                createdAt: new Date().toISOString()
            };
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Exporta dados em JSON
     */
    export() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Salva dados no localStorage
     */
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    /**
     * Carrega dados do localStorage
     */
    load() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
        }
        return this.data;
    }

    /**
     * Gera ID único
     */
    generateId() {
        return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Formata valor monetário
     */
    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Formata data/hora
     */
    static formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Obtém data legível
     */
    static formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Exportar para uso global
window.BalanceManager = BalanceManager;
