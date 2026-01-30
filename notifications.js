/**
 * Notification System - Toast/Notificações
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Criar container de notificações
        if (!document.getElementById('toastContainer')) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toastContainer');
        }
    }

    show(message, type = 'success', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-message">${message}</span>`;

        this.container.appendChild(toast);

        // Remove automaticamente após duração
        setTimeout(() => {
            toast.remove();
        }, duration);

        return toast;
    }

    success(message) {
        return this.show(message, 'success', 5000);
    }

    error(message) {
        return this.show(message, 'error', 5000);
    }
}

// Instância global
window.notifications = new NotificationSystem();
