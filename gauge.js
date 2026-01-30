/**
 * Gauge Component - Medidor Semicircular Animado
 * Com glassmorphism, glow leve e animação smooth
 */

class SemiCircularGauge {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas com ID "${canvasId}" não encontrado`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        
        // Configurações padrão
        this.options = {
            percentage: options.percentage || 0,
            targetPercentage: options.targetPercentage || 0,
            radius: options.radius || 70,
            strokeWidth: options.strokeWidth || 8,
            backgroundColor: options.backgroundColor || 'rgba(99, 102, 241, 0.1)',
            progressColor: options.progressColor || '#6366f1',
            textColor: options.textColor || '#f1f5f9',
            duration: options.duration || 2000,
            easing: options.easing || this.easeInOutCubic,
            ...options
        };

        this.startTime = null;
        this.animationId = null;

        // Definir DPI para qualidade em alta resolução
        this.setupCanvas();
        this.animate();
    }

    setupCanvas() {
        const dpi = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpi;
        this.canvas.height = rect.height * dpi;

        this.ctx.scale(dpi, dpi);

        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    drawBackgroundArc() {
        const { radius, strokeWidth, backgroundColor } = this.options;

        this.ctx.beginPath();
        this.ctx.arc(
            this.centerX,
            this.centerY,
            radius,
            Math.PI,
            2 * Math.PI,
            false
        );

        this.ctx.strokeStyle = backgroundColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    drawProgressArc(percentage) {
        const { radius, strokeWidth, progressColor } = this.options;

        // Criar gradiente para o arco
        const gradient = this.ctx.createLinearGradient(
            this.centerX - radius,
            this.centerY,
            this.centerX + radius,
            this.centerY
        );

        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.6)');

        const angle = (percentage / 100) * Math.PI;

        this.ctx.beginPath();
        this.ctx.arc(
            this.centerX,
            this.centerY,
            radius,
            Math.PI,
            Math.PI + angle,
            false
        );

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();

        // Limpar shadow para próximas operações
        this.ctx.shadowColor = 'transparent';
    }

    drawGlowEffect(percentage) {
        const { radius, strokeWidth } = this.options;
        const angle = (percentage / 100) * Math.PI;

        // Calcular posição do ponto final do arco
        const endX = this.centerX + radius * Math.cos(Math.PI + angle);
        const endY = this.centerY + radius * Math.sin(Math.PI + angle);

        // Desenhar glow no ponto final
        const glowGradient = this.ctx.createRadialGradient(endX, endY, 0, endX, endY, 15);
        glowGradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
        glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 15, 0, 2 * Math.PI);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();

        // Desenhar ponto central do glow
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 4, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ec4899';
        this.ctx.fill();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    render(percentage) {
        this.clear();
        this.drawBackgroundArc();
        this.drawProgressArc(percentage);
        this.drawGlowEffect(percentage);
    }

    animate() {
        const startPercentage = this.options.percentage;
        const targetPercentage = this.options.targetPercentage;
        const duration = this.options.duration;

        const animationStep = (timestamp) => {
            if (!this.startTime) {
                this.startTime = timestamp;
            }

            const elapsed = timestamp - this.startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.options.easing(progress);

            const currentPercentage =
                startPercentage + (targetPercentage - startPercentage) * easedProgress;

            this.render(currentPercentage);
            this.options.percentage = currentPercentage;

            if (progress < 1) {
                this.animationId = requestAnimationFrame(animationStep);
            } else {
                this.options.percentage = targetPercentage;
                this.render(targetPercentage);
            }
        };

        this.animationId = requestAnimationFrame(animationStep);
    }

    updatePercentage(newPercentage) {
        this.options.targetPercentage = newPercentage;
        this.startTime = null;
        this.animate();
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Exportar para uso global
window.SemiCircularGauge = SemiCircularGauge;
