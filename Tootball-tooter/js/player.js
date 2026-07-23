class Player {
    constructor() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = GAME_SETTINGS.penaltySpotY;
        this.targetX = this.x;
        this.size = 40;
        this.tigerData = null;
        this.running = false;
        this.keys = { left: false, right: false, up: false, down: false, space: false };
        this.lastDirectionPress = null;
        this.lastSpacePress = null;
        this.canShoot = false;
        this._setupListeners();
    }

    setTiger(tigerData) {
        this.tigerData = tigerData;
    }

    _setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.keys.left = true;
                if (this.canShoot && !e.repeat) {
                    this.lastDirectionPress = { direction: 'left', time: performance.now() };
                    this._checkIfSpaceHeld();
                }
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.keys.right = true;
                if (this.canShoot && !e.repeat) {
                    this.lastDirectionPress = { direction: 'right', time: performance.now() };
                    this._checkIfSpaceHeld();
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.keys.up = true;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.keys.down = true;
                if (this.canShoot && !e.repeat) {
                    this.lastDirectionPress = { direction: 'down', time: performance.now() };
                    this._checkIfSpaceHeld();
                }
            }
            if (e.key === ' ') {
                e.preventDefault();
                this.keys.space = true;
                if (!e.repeat) {
                    this.lastSpacePress = performance.now();
                    this._checkIfDirectionHeld();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === 'ArrowUp') this.keys.up = false;
            if (e.key === 'ArrowDown') this.keys.down = false;
            if (e.key === ' ') this.keys.space = false;
        });
    }

    _checkIfSpaceHeld() {
        if (this.keys.space && !this.lastSpacePress) {
            this.lastSpacePress = performance.now();
        }
    }

    _checkIfDirectionHeld() {
        if (!this.lastDirectionPress) {
            if (this.keys.left) {
                this.lastDirectionPress = { direction: 'left', time: performance.now() };
            } else if (this.keys.right) {
                this.lastDirectionPress = { direction: 'right', time: performance.now() };
            } else if (this.keys.down) {
                this.lastDirectionPress = { direction: 'down', time: performance.now() };
            }
        }
    }

    reset() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = GAME_SETTINGS.penaltySpotY;
        this.targetX = this.x;
        this.running = false;
        this.lastDirectionPress = null;
        this.lastSpacePress = null;
        this.keys = { left: false, right: false, up: false, down: false, space: false };
        this.canShoot = false;
    }

    enableShooting() {
        this.canShoot = true;
        this.lastDirectionPress = null;
        this.lastSpacePress = null;
    }

    update() {
        if (this.keys.left) {
            this.targetX -= GAME_SETTINGS.moveSpeed;
        }
        if (this.keys.right) {
            this.targetX += GAME_SETTINGS.moveSpeed;
        }

        const minX = (GAME_SETTINGS.canvasWidth - GAME_SETTINGS.goalWidth) / 2 + 20;
        const maxX = (GAME_SETTINGS.canvasWidth + GAME_SETTINGS.goalWidth) / 2 - 20;
        this.targetX = Math.max(minX, Math.min(maxX, this.targetX));
        this.x += (this.targetX - this.x) * 0.2;

        if (this.keys.up && this.y > GAME_SETTINGS.goalY + GAME_SETTINGS.goalHeight + 20) {
            this.running = true;
            this.y -= GAME_SETTINGS.runSpeed;
        }

        return this.running && this.y <= GAME_SETTINGS.goalY + GAME_SETTINGS.goalHeight + 80;
    }

    checkShotTiming() {
        if (!this.lastDirectionPress || !this.lastSpacePress) {
            return { timed: false, direction: null };
        }

        const timeDiff = Math.abs(this.lastDirectionPress.time - this.lastSpacePress);
        const tolerance = GAME_SETTINGS.hardMode ? GAME_SETTINGS.hardTimingToleranceMs : GAME_SETTINGS.timingToleranceMs;
        const timed = timeDiff <= tolerance;

        return { timed, direction: this.lastDirectionPress.direction };
    }

    isAtShootingPosition() {
        return this.y <= GAME_SETTINGS.goalY + GAME_SETTINGS.goalHeight + 80;
    }
}
