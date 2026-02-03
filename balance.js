/**
 * balance.js - Gerenciador de Ganhos e Perdas
 */

class BalanceManager {
    constructor() {
        this.transactions = this.loadTransactions();
        this.gains = this.calculateTotalGains();
        this.losses = this.calculateTotalLosses();
    }

    loadTransactions() {
        const stored = localStorage.getItem('football_transactions');
        return stored ? JSON.parse(stored) : [];
    }

    saveTransactions() {
        localStorage.setItem('football_transactions', JSON.stringify(this.transactions));
    }

    addGain(amount) {
        if (amount <= 0) return false;
        
        const transaction = {
            id: Date.now(),
            type: 'gain',
            amount: parseFloat(amount),
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        this.gains = this.calculateTotalGains();
        return transaction;
    }

    addLoss(amount) {
        if (amount <= 0) return false;
        
        const transaction = {
            id: Date.now(),
            type: 'loss',
            amount: parseFloat(amount),
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        this.losses = this.calculateTotalLosses();
        return transaction;
    }

    calculateTotalGains() {
        return this.transactions
            .filter(t => t.type === 'gain')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    calculateTotalLosses() {
        return this.transactions
            .filter(t => t.type === 'loss')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getBalance() {
        return this.gains - this.losses;
    }

    getBalancePercentages() {
        const total = this.gains + this.losses;
        if (total === 0) return { gains: 50, losses: 50 };
        
        return {
            gains: (this.gains / total) * 100,
            losses: (this.losses / total) * 100
        };
    }

    getAllTransactions() {
        return this.transactions;
    }

    getRecentTransactions(limit = 10) {
        return this.transactions.slice(-limit).reverse();
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}
