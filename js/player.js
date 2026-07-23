class Player {
    constructor() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = GAME_SETTINGS.penaltySpotY;
        this.targetX = this.x;
        this.size = 40;
        this.tigerData = null;
        this.running = false;

        this.aimX = GAME_SETTINGS.goalCenterX;
        this.aimY = GAME_SETTINGS.goalCenterY;
        this.aimVx = 0;
        this.aimVy = 0;

        this.keys = { left: false, right: false, up: false, down: false, space: false };
        this._setupListeners();
    }

    setTiger(tigerData) {
        this.tigerData = tigerData;
    }

    _setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.keys.left = true; }
            if (e.key === 'ArrowRight') { e.preventDefault(); this.keys.right = true; }
            if (e.key === 'ArrowUp') { e.preventDefault(); this.keys.up = true; }
            if (e.key === 'ArrowDown') { e.preventDefault(); this.keys.down = true; }
            if (e.key === ' ') { e.preventDefault(); this.keys.space = true; }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === 'ArrowUp') this.keys.up = false;
            if (e.key === 'ArrowDown') this.keys.down = false;
            if (e.key === ' ') this.keys.space = false;
        });
    }

    reset() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = GAME_SETTINGS.penaltySpotY;
        this.targetX = this.x;
        this.running = false;
        this.aimX = GAME_SETTINGS.goalCenterX;
        this.aimY = GAME_SETTINGS.goalCenterY;
        this.aimVx = 0;
        this.aimVy = 0;
        this.keys = { left: false, right: false, up: false, down: false, space: false };
    }

    updateRun() {
        if (this.keys.left) this.targetX -= GAME_SETTINGS.strafeSpeed;
        if (this.keys.right) this.targetX += GAME_SETTINGS.strafeSpeed;

        const minX = (GAME_SETTINGS.canvasWidth - GAME_SETTINGS.goalWidth) / 2 + 20;
        const maxX = (GAME_SETTINGS.canvasWidth + GAME_SETTINGS.goalWidth) / 2 - 20;
        this.targetX = Math.max(minX, Math.min(maxX, this.targetX));
        this.x += (this.targetX - this.x) * 0.2;

        if (this.keys.up && this.y > GAME_SETTINGS.goalY + GAME_SETTINGS.goalHeight + 20) {
            this.running = true;
            this.y -= GAME_SETTINGS.runSpeed;
        }
    }

    updateAim() {
        const s = GAME_SETTINGS;

        if (this.keys.left) this.aimVx -= s.aimAccel;
        if (this.keys.right) this.aimVx += s.aimAccel;
        if (this.keys.up) this.aimVy -= s.aimAccel;
        if (this.keys.down) this.aimVy += s.aimAccel;

        if (!this.keys.left && !this.keys.right) this.aimVx *= s.aimFriction;
        if (!this.keys.up && !this.keys.down) this.aimVy *= s.aimFriction;

        const speed = Math.sqrt(this.aimVx * this.aimVx + this.aimVy * this.aimVy);
        if (speed > s.aimMaxSpeed) {
            this.aimVx = (this.aimVx / speed) * s.aimMaxSpeed;
            this.aimVy = (this.aimVy / speed) * s.aimMaxSpeed;
        }

        this.aimX += this.aimVx;
        this.aimY += this.aimVy;

        this.aimX += Math.sin(performance.now() / 137) * s.aimJitter;
        this.aimY += Math.cos(performance.now() / 151) * s.aimJitter;

        this.aimX = Math.max(s.goalLeft, Math.min(s.goalRight, this.aimX));
        this.aimY = Math.max(s.goalTop, Math.min(s.goalBottom, this.aimY));

        if (this.aimX <= s.goalLeft && this.aimVx < 0) this.aimVx = 0;
        if (this.aimX >= s.goalRight && this.aimVx > 0) this.aimVx = 0;
        if (this.aimY <= s.goalTop && this.aimVy < 0) this.aimVy = 0;
        if (this.aimY >= s.goalBottom && this.aimVy > 0) this.aimVy = 0;
    }

    resetAim() {
        this.aimX = GAME_SETTINGS.goalCenterX;
        this.aimY = GAME_SETTINGS.goalCenterY;
        this.aimVx = 0;
        this.aimVy = 0;
    }
}
