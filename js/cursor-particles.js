// Cursor Particle Effect
class CursorParticles {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 100;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.animate();
    }
    
    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9997';
        document.body.appendChild(this.canvas);
        this.resize();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.createParticle();
        });
    }
    
    createParticle() {
        if (this.particles.length < this.maxParticles) {
            const isDark = document.body.classList.contains('dark-theme');
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 10,
                y: this.mouseY + (Math.random() - 0.5) * 10,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1,
                speedY: Math.random() * 0.5,
                life: 1,
                decay: Math.random() * 0.005 + 0.003,
                color: isDark ? `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})` : `rgba(0, 0, 0, ${Math.random() * 0.5 + 0.3})`
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= particle.decay;
            particle.speedY += 0.02; // Gravity effect
            return particle.life > 0;
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CursorParticles();
    });
} else {
    new CursorParticles();
}
