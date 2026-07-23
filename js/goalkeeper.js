class Goalkeeper {
    constructor() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.startY = GAME_SETTINGS.goalY + GAME_SETTINGS.goalHeight - 20;
        this.y = this.startY;
        this.size = 35;
        this.diveDirection = null;
        this.diving = false;
        this.diveProgress = 0;
        this.arrowDirection = null;
        this.arrowVisible = false;
    }

    reset() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = this.startY;
        this.diveDirection = null;
        this.diving = false;
        this.diveProgress = 0;
        this.arrowDirection = null;
        this.arrowVisible = false;
    }

    revealDirection() {
        if (GAME_SETTINGS.hardMode) {
            const r = Math.random();
            if (r < 0.33) this.arrowDirection = 'left';
            else if (r < 0.66) this.arrowDirection = 'right';
            else this.arrowDirection = 'up';
        } else {
            this.arrowDirection = Math.random() < 0.5 ? 'left' : 'right';
        }
        this.arrowVisible = true;
        return this.arrowDirection;
    }

    dive() {
        this.diving = true;
        if (this.arrowDirection === 'left') this.diveDirection = 'left';
        else if (this.arrowDirection === 'right') this.diveDirection = 'right';
        else this.diveDirection = 'center';
        this.diveProgress = 0;
    }

    update() {
        if (!this.diving) return;

        this.diveProgress = Math.min(this.diveProgress + 0.1, 1);

        const goalCenterX = GAME_SETTINGS.canvasWidth / 2;
        const diveDistance = 100;

        if (this.diveDirection === 'left') {
            this.x = goalCenterX - diveDistance * this.diveProgress;
        } else if (this.diveDirection === 'right') {
            this.x = goalCenterX + diveDistance * this.diveProgress;
        } else if (this.diveDirection === 'center') {
            this.y = this.startY - diveDistance * this.diveProgress;
        }
    }

    getArrowPosition() {
        return {
            x: GAME_SETTINGS.canvasWidth / 2,
            y: GAME_SETTINGS.goalY - 30
        };
    }
}
