// Cursor Code-Trail Effect
// Trails little programming symbols/tokens behind the cursor instead of plain particles.
class CursorCodeTrail {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 60;
        this.mouseX = 0;
        this.mouseY = 0;

        this.tokens = ['{', '}', '<', '>', '/', ';', '=', '=>', '0', '1', '#', '[]', '()', '&&', '||', 'const', 'div', 'fn'];

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
            const token = this.tokens[Math.floor(Math.random() * this.tokens.length)];
            this.particles.push({
                x: this.mouseX + (Math.random() - 0.5) * 12,
                y: this.mouseY + (Math.random() - 0.5) * 12,
                text: token,
                size: Math.random() * 6 + 11,
                speedX: (Math.random() - 0.5) * 0.6,
                speedY: Math.random() * 0.4 + 0.2,
                rotation: (Math.random() - 0.5) * 0.4,
                life: 1,
                decay: Math.random() * 0.012 + 0.01,
                color: Math.random() < 0.5 ? '#17171B' : '#D9622B' // black / brand orange mix
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += 0.01;
            p.life -= p.decay;
            return p.life > 0;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(p.life, 0);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.font = `600 ${p.size}px "SF Mono", "Fira Code", Consolas, monospace`;
            this.ctx.fillStyle = `hsl(${p.hue}, 70%, 45%)`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.text, 0, 0);
            this.ctx.restore();
        });
        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CursorCodeTrail();
    });
} else {
    new CursorCodeTrail();
}
