class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.width;
        this.h = canvas.height;
        this.vanishingPointY = 100;
        this.vanishingPointX = this.w / 2;
    }

    clear() {
        this.ctx.fillStyle = '#1a5c1a';
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    drawPitch() {
        const ctx = this.ctx;
        const horizon = this.vanishingPointY;
        const groundBottom = this.h;

        ctx.fillStyle = '#2d8c2d';
        ctx.fillRect(0, horizon, this.w, groundBottom - horizon);

        for (let i = 0; i < 15; i++) {
            const y1 = horizon + (groundBottom - horizon) * (i / 15);
            const y2 = horizon + (groundBottom - horizon) * ((i + 1) / 15);
            ctx.fillStyle = i % 2 === 0 ? '#2d8c2d' : '#259225';
            const shrink1 = (y1 - horizon) / (groundBottom - horizon) * 0.4;
            const shrink2 = (y2 - horizon) / (groundBottom - horizon) * 0.4;
            ctx.fillRect(this.w * shrink1, y1, this.w * (1 - shrink1 * 2), y2 - y1);
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const boxTop = horizon + (groundBottom - horizon) * 0.1;
        const boxBottom = horizon + (groundBottom - horizon) * 0.6;
        const boxShrink1 = (boxTop - horizon) / (groundBottom - horizon) * 0.4;
        const boxShrink2 = (boxBottom - horizon) / (groundBottom - horizon) * 0.4;
        ctx.moveTo(this.w * boxShrink1, boxTop);
        ctx.lineTo(this.w * (1 - boxShrink1), boxTop);
        ctx.lineTo(this.w * (1 - boxShrink2), boxBottom);
        ctx.lineTo(this.w * boxShrink2, boxBottom);
        ctx.closePath();
        ctx.stroke();

        const spotY = horizon + (groundBottom - horizon) * 0.75;
        const spotX = this.w / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(spotX, spotY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGoal() {
        const ctx = this.ctx;
        const goalW = GAME_SETTINGS.goalWidth;
        const goalH = GAME_SETTINGS.goalHeight;
        const goalX = (this.w - goalW) / 2;
        const goalY = GAME_SETTINGS.goalY;

        ctx.fillStyle = '#444';
        ctx.fillRect(goalX - 6, goalY, 6, goalH);
        ctx.fillRect(goalX + goalW, goalY, 6, goalH);
        ctx.fillRect(goalX - 6, goalY - 6, goalW + 12, 6);

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let x = goalX; x <= goalX + goalW; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, goalY);
            ctx.lineTo(x, goalY + goalH);
            ctx.stroke();
        }
        for (let y = goalY; y <= goalY + goalH; y += 20) {
            ctx.beginPath();
            ctx.moveTo(goalX, y);
            ctx.lineTo(goalX + goalW, y);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(goalX, goalY, goalW, goalH);
    }

    drawTiger(x, y, size, tigerData) {
        const ctx = this.ctx;
        const scale = size / 40;

        const drawPixelRect = (px, py, pw, ph, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x + px * scale, y + py * scale, pw * scale, ph * scale);
        };

        drawPixelRect(-8, -20, 16, 16, tigerData.color);
        drawPixelRect(-6, -18, 12, 12, tigerData.noseColor);

        drawPixelRect(-4, -16, 2, 2, '#000');
        drawPixelRect(2, -16, 2, 2, '#000');
        drawPixelRect(-1, -12, 2, 2, tigerData.stripeColor);
        drawPixelRect(-1, -10, 2, 1, '#FF6B6B');

        drawPixelRect(-10, -22, 4, 4, tigerData.color);
        drawPixelRect(6, -22, 4, 4, tigerData.color);

        drawPixelRect(-4, -4, 8, 14, tigerData.color);
        drawPixelRect(-3, -2, 2, 10, tigerData.stripeColor);
        drawPixelRect(1, 0, 2, 8, tigerData.stripeColor);

        drawPixelRect(-6, 10, 4, 8, tigerData.color);
        drawPixelRect(2, 10, 4, 8, tigerData.color);
        drawPixelRect(-5, 10, 2, 6, tigerData.stripeColor);
        drawPixelRect(3, 10, 2, 6, tigerData.stripeColor);

        drawPixelRect(4, -2, 6, 4, tigerData.color);
        drawPixelRect(7, -1, 2, 2, tigerData.stripeColor);
    }

    drawGoalkeeper(x, y, size, diving = null) {
        const ctx = this.ctx;
        const scale = size / 40;

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - 6 * scale, y - 16 * scale, 12 * scale, 8 * scale);

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x - 4 * scale, y - 14 * scale, 8 * scale, 4 * scale);

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - 5 * scale, y - 8 * scale, 10 * scale, 14 * scale);

        if (diving === 'left') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x - 16 * scale, y - 6 * scale, 12 * scale, 4 * scale);
            ctx.fillRect(x + 4 * scale, y - 6 * scale, 8 * scale, 4 * scale);
        } else if (diving === 'right') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x - 12 * scale, y - 6 * scale, 8 * scale, 4 * scale);
            ctx.fillRect(x + 4 * scale, y - 6 * scale, 12 * scale, 4 * scale);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x - 12 * scale, y - 4 * scale, 6 * scale, 4 * scale);
            ctx.fillRect(x + 6 * scale, y - 4 * scale, 6 * scale, 4 * scale);
        }

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - 6 * scale, y + 6 * scale, 4 * scale, 8 * scale);
        ctx.fillRect(x + 2 * scale, y + 6 * scale, 4 * scale, 8 * scale);
    }

    drawBall(x, y, size) {
        const ctx = this.ctx;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const px = x + Math.cos(angle) * size * 0.65;
            const py = y + Math.sin(angle) * size * 0.65;
            ctx.beginPath();
            ctx.arc(px, py, size * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCrosshair(x, y) {
        const ctx = this.ctx;
        const size = 12;

        ctx.save();
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - size - 4, y);
        ctx.lineTo(x + size + 4, y);
        ctx.moveTo(x, y - size - 4);
        ctx.lineTo(x, y + size + 4);
        ctx.stroke();

        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawPowerBar(x, y, power, visible) {
        if (!visible) return;
        const ctx = this.ctx;
        const barWidth = 200;
        const barHeight = 22;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(x - barWidth / 2 - 2, y - 2, barWidth + 4, barHeight + 4);

        const color = power > 0.8 ? '#4CAF50' : power > 0.45 ? '#FFD700' : '#f44336';
        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, y, barWidth * power, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - barWidth / 2 - 2, y - 2, barWidth + 4, barHeight + 4);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(power * 100) + '%', x, y + 15);
        ctx.restore();
    }

    drawGoalZones(keeperDiveDirection) {
        const ctx = this.ctx;
        const g = GAME_SETTINGS;
        ctx.save();
        ctx.globalAlpha = 0.12;

        let zoneCenter, zoneW = 35;
        if (keeperDiveDirection === 'center') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(g.goalCenterX - 70, g.goalTop, 140, g.goalHeight);
        } else if (keeperDiveDirection === 'left') {
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(g.goalLeft, g.goalTop, 140, g.goalHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(g.goalRight - zoneW, g.goalTop, zoneW, g.goalHeight);
        } else if (keeperDiveDirection === 'right') {
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(g.goalRight - 140, g.goalTop, 140, g.goalHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(g.goalLeft, g.goalTop, zoneW, g.goalHeight);
        }
        ctx.restore();
    }

    drawUI(score, shots, maxShots, message, messageType) {
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, 10, 200, 60);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`Goals: ${score} / ${shots}`, 30, 40);
        ctx.font = '16px monospace';
        ctx.fillText(`Shot ${Math.min(shots + 1, maxShots)} of ${maxShots}`, 30, 60);

        if (message) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(this.w / 2 - 180, this.h / 2 - 45, 360, 90);

            ctx.font = 'bold 32px monospace';
            ctx.textAlign = 'center';
            if (messageType === 'goal') {
                ctx.fillStyle = '#4CAF50';
            } else if (messageType === 'save') {
                ctx.fillStyle = '#f44336';
            } else if (messageType === 'miss') {
                ctx.fillStyle = '#FF9800';
            } else {
                ctx.fillStyle = '#fff';
            }
            ctx.fillText(message, this.w / 2, this.h / 2 + 12);
            ctx.textAlign = 'left';
        }
    }

    drawControls() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.w - 230, this.h - 90, 220, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText('↑ : Run Forward', this.w - 220, this.h - 65);
        ctx.fillText('← → ↑ ↓ : Aim', this.w - 220, this.h - 48);
        ctx.fillText('SPACE : Charge & Shoot', this.w - 220, this.h - 31);
        ctx.fillText('Release SPACE to fire', this.w - 220, this.h - 14);
    }

    drawShootTimer(progress) {
        const ctx = this.ctx;
        const barWidth = 200;
        const barHeight = 12;
        const x = (this.w - barWidth) / 2;
        const y = this.h - 60;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        const color = progress > 0.5 ? '#4CAF50' : progress > 0.25 ? '#FF9800' : '#f44336';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth * progress, barHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    startConfetti() {
        this.confettiParticles = [];
        const colors = ['#FF0000', '#FFD700', '#4CAF50', '#4169E1', '#FF69B4', '#FF8C00', '#9370DB'];
        for (let i = 0; i < 120; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.w,
                y: -20 - Math.random() * 150,
                vx: (Math.random() - 0.5) * 6,
                vy: 1 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 3 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                life: 1
            });
        }
    }

    clearConfetti() {
        this.confettiParticles = [];
    }

    updateConfetti() {
        if (!this.confettiParticles || this.confettiParticles.length === 0) return;
        for (const p of this.confettiParticles) {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.vy += 0.04;
            p.life -= 0.005;
        }
        this.confettiParticles = this.confettiParticles.filter(p => p.y < this.h + 20 && p.life > 0);
    }

    drawConfetti() {
        if (!this.confettiParticles || this.confettiParticles.length === 0) return;
        const ctx = this.ctx;
        ctx.save();
        for (const p of this.confettiParticles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        }
        ctx.restore();
    }
}
