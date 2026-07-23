class Goalkeeper {
    constructor() {
        this.startX = GAME_SETTINGS.canvasWidth / 2;
        this.startY = GAME_SETTINGS.goalY + GAME_SETTINGS.goalHeight - 20;
        this.x = this.startX;
        this.y = this.startY;
        this.size = 35;
        this.diveDirection = null;
        this.diving = false;
        this.diveProgress = 0;

        this.weights = { left: 0.33, center: 0.34, right: 0.33 };
        this.shotHistory = [];
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.diveDirection = null;
        this.diving = false;
        this.diveProgress = 0;
    }

    resetLearning() {
        this.weights = { left: 0.33, center: 0.34, right: 0.33 };
        this.shotHistory = [];
    }

    chooseDirection() {
        const noise = GAME_SETTINGS.keeperNoise;
        const noisy = {
            left: this.weights.left + (Math.random() - 0.5) * noise,
            center: this.weights.center + (Math.random() - 0.5) * noise,
            right: this.weights.right + (Math.random() - 0.5) * noise
        };
        const total = noisy.left + noisy.center + noisy.right;
        noisy.left /= total;
        noisy.center /= total;
        noisy.right /= total;

        const r = Math.random();
        if (r < noisy.left) return 'left';
        if (r < noisy.left + noisy.center) return 'center';
        return 'right';
    }

    learnFromShot(aimX) {
        const third = GAME_SETTINGS.goalWidth / 3;
        const relX = aimX - GAME_SETTINGS.goalLeft;
        let zone;
        if (relX < third) zone = 'left';
        else if (relX < third * 2) zone = 'center';
        else zone = 'right';
        this.shotHistory.push(zone);

        const counts = { left: 0, center: 0, right: 0 };
        for (const z of this.shotHistory) counts[z]++;
        const total = this.shotHistory.length;

        const base = { left: 0.33, center: 0.34, right: 0.33 };
        const rate = GAME_SETTINGS.keeperLearningRate;
        this.weights = {
            left: base.left + (counts.left / total - base.left) * rate,
            center: base.center + (counts.center / total - base.center) * rate,
            right: base.right + (counts.right / total - base.right) * rate
        };
    }

    dive(direction) {
        this.diving = true;
        this.diveDirection = direction;
        this.diveProgress = 0;
    }

    update() {
        if (!this.diving) return;
        this.diveProgress = Math.min(this.diveProgress + 0.08, 1);
        const smooth = this.diveProgress < 0.5
            ? 2 * this.diveProgress * this.diveProgress
            : 1 - Math.pow(-2 * this.diveProgress + 2, 2) / 2;

        const dist = GAME_SETTINGS.keeperDiveDist;
        const cx = GAME_SETTINGS.canvasWidth / 2;
        if (this.diveDirection === 'left') {
            this.x = cx - dist * smooth;
        } else if (this.diveDirection === 'right') {
            this.x = cx + dist * smooth;
        } else {
            this.y = this.startY - dist * smooth;
        }
    }

    getSaveZone(power) {
        const reachH = GAME_SETTINGS.keeperReachH * (GAME_SETTINGS.keeperPowerReachFactor - power * 0.5);
        const reachV = GAME_SETTINGS.keeperReachV;
        const cx = GAME_SETTINGS.canvasWidth / 2;

        let keeperX = cx;
        let keeperY = this.startY;
        if (this.diveDirection === 'left') keeperX = cx - GAME_SETTINGS.keeperDiveDist;
        else if (this.diveDirection === 'right') keeperX = cx + GAME_SETTINGS.keeperDiveDist;
        else keeperY = this.startY - GAME_SETTINGS.keeperDiveDist;

        return { x: keeperX, y: keeperY, reachH, reachV };
    }

    isSaved(ballX, ballY, power) {
        const zone = this.getSaveZone(power);

        const distFromCenterY = Math.abs(ballY - GAME_SETTINGS.goalCenterY);
        const heightBonus = Math.min(1, distFromCenterY / 50) * 0.3;
        const effReachH = zone.reachH * (1 - heightBonus);
        const effReachV = zone.reachV * (1 - heightBonus * 0.5);

        const dx = Math.abs(ballX - zone.x);
        const dy = Math.abs(ballY - zone.y);
        return dx <= effReachH && dy <= effReachV;
    }
}
