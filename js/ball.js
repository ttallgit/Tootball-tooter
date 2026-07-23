class Ball {
    constructor() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = GAME_SETTINGS.penaltySpotY + 30;
        this.size = 8;
        this.animating = false;
        this.animStartX = 0;
        this.animStartY = 0;
        this.animTargetX = 0;
        this.animTargetY = 0;
        this.animStartTime = 0;
        this.animDuration = GAME_SETTINGS.ballAnimMs;
    }

    reset(playerX) {
        this.x = playerX;
        this.y = GAME_SETTINGS.penaltySpotY + 30;
        this.animating = false;
    }

    startAnimation(targetX, targetY, duration) {
        this.animStartX = this.x;
        this.animStartY = this.y;
        this.animTargetX = targetX;
        this.animTargetY = targetY;
        this.animStartTime = performance.now();
        if (duration) this.animDuration = duration;
        this.animating = true;
    }

    updateAnimation() {
        if (!this.animating) return;

        const elapsed = performance.now() - this.animStartTime;
        const t = Math.min(1, elapsed / this.animDuration);

        const smooth = t * t * (3 - 2 * t);

        this.x = this.animStartX + (this.animTargetX - this.animStartX) * smooth;

        const arcHeight = -90 * Math.sin(smooth * Math.PI);
        this.y = this.animStartY + (this.animTargetY - this.animStartY) * smooth + arcHeight;

        if (t >= 1) {
            this.x = this.animTargetX;
            this.y = this.animTargetY;
            this.animating = false;
        }
    }
}
