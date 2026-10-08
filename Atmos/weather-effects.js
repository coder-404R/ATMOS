/**
 * Atmos Weather Effects - Canvas Particle System
 * Free, zero-dependency atmospheric particle emitter for Rain, Snow, Lightning, Fog, and Sunbeams.
 */

class WeatherEffects {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.currentCondition = 'clear';
    this.animationFrame = null;
    this.flashAlpha = 0;
    this.lastFlashTime = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.initParticles();
  }

  setCondition(condition, isNight = false) {
    const c = condition.toLowerCase();
    this.isNight = isNight;
    if (c.includes('rain') || c.includes('drizzle')) {
      this.currentCondition = 'rain';
    } else if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) {
      this.currentCondition = 'snow';
    } else if (c.includes('thunder') || c.includes('storm')) {
      this.currentCondition = 'storm';
    } else if (c.includes('fog') || c.includes('mist') || c.includes('haze')) {
      this.currentCondition = 'fog';
    } else if (c.includes('sun') || c.includes('clear')) {
      this.currentCondition = this.isNight ? 'stars' : 'sun';
    } else {
      this.currentCondition = this.isNight ? 'stars' : 'clouds';
    }
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    let count = 0;

    if (this.currentCondition === 'stars') {
      count = 80;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * (this.height * 0.7),
          radius: Math.random() * 1.8 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          step: Math.random() * Math.PI * 2
        });
      }
    } else if (this.currentCondition === 'rain' || this.currentCondition === 'storm') {
      count = this.currentCondition === 'storm' ? 140 : 80;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 12 + 10,
          opacity: Math.random() * 0.5 + 0.3,
          tilt: Math.random() * 2 - 4
        });
      }
    } else if (this.currentCondition === 'snow') {
      count = 70;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          swing: Math.random() * 0.05,
          step: Math.random() * Math.PI * 2
        });
      }
    } else if (this.currentCondition === 'fog') {
      count = 25;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 150 + 100,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.12 + 0.03
        });
      }
    } else if (this.currentCondition === 'sun') {
      count = 12;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * (this.height / 2),
          radius: Math.random() * 4 + 2,
          speedY: -(Math.random() * 0.4 + 0.2),
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    }
  }

  start() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    const render = () => {
      this.updateAndDraw();
      this.animationFrame = requestAnimationFrame(render);
    };
    render();
  }

  updateAndDraw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentCondition === 'stars') {
      for (let p of this.particles) {
        p.step += p.pulseSpeed;
        const currentOpacity = Math.abs(Math.sin(p.step)) * p.opacity;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (this.currentCondition === 'rain' || this.currentCondition === 'storm') {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 1.2;

      for (let p of this.particles) {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.tilt, p.y + p.length);
        this.ctx.stroke();

        p.y += p.speed;
        p.x += p.tilt;

        if (p.y > this.height) {
          p.y = -p.length;
          p.x = Math.random() * this.width;
        }
      }

      if (this.currentCondition === 'storm') {
        const now = Date.now();
        if (now - this.lastFlashTime > 4000 && Math.random() < 0.015) {
          this.flashAlpha = Math.random() * 0.45 + 0.25;
          this.lastFlashTime = now;
        }
        if (this.flashAlpha > 0) {
          this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
          this.ctx.fillRect(0, 0, this.width, this.height);
          this.flashAlpha -= 0.03;
        }
      }

    } else if (this.currentCondition === 'snow') {
      for (let p of this.particles) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.step += p.swing;
        p.x += Math.sin(p.step) * 0.8;
        p.y += p.speed;

        if (p.y > this.height) {
          p.y = -p.radius;
          p.x = Math.random() * this.width;
        }
      }
    } else if (this.currentCondition === 'fog') {
      for (let p of this.particles) {
        let grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(230, 240, 255, ${p.opacity})`);
        grad.addColorStop(1, 'rgba(230, 240, 255, 0)');

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.x += p.speed;
        if (p.x - p.radius > this.width) {
          p.x = -p.radius;
        }
      }
    } else if (this.currentCondition === 'sun') {
      for (let p of this.particles) {
        this.ctx.fillStyle = `rgba(254, 240, 138, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speedY;
        if (p.y < 0) {
          p.y = this.height / 2;
          p.x = Math.random() * this.width;
        }
      }
    }
  }
}

window.WeatherEffects = WeatherEffects;
