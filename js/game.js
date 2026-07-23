class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.player = new Player();
        this.goalkeeper = new Goalkeeper();
        this.ball = new Ball();

        this.state = STATES.READY;
        this.score = 0;
        this.shots = 0;
        this.maxShots = GAME_SETTINGS.shotsPerRound;
        this.message = '';
        this.messageType = '';
        this.messageTimer = 0;

        this.countdown = 3;
        this.countdownTimer = 0;
        this.countdownActive = false;

        this.power = 0;
        this.powerCharging = false;
        this.chargeStartTime = 0;

        this.aimingStartTime = 0;
        this.resultMessageShown = false;

        this.pendingResult = null;
        this.pendingMessage = '';
        this.pendingMessageType = '';
        this.shotResolved = false;

        this.shotHistory = [];
        this.animationFrameId = null;
        this.lastShotPower = 0;

        this.h = GAME_SETTINGS.canvasHeight;
        this.w = GAME_SETTINGS.canvasWidth;
    }

    start(tigerData) {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.player.setTiger(tigerData);
        this.goalkeeper.resetLearning();
        this.score = 0;
        this.shots = 0;
        this.shotHistory = [];
        this.state = STATES.READY;

        const gameOver = document.getElementById('game-over');
        if (gameOver) gameOver.style.display = 'none';

        this._resetShot();
        this._startGameLoop();
    }

    _startGameLoop() {
        const loop = () => {
            this._update();
            this._render();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }

    _resetShot() {
        this.player.reset();
        this.goalkeeper.reset();
        this.ball.reset(GAME_SETTINGS.canvasWidth / 2);
        this.renderer.clearConfetti();

        this.countdown = 3;
        this.countdownTimer = 0;
        this.countdownActive = false;

        this.power = 0;
        this.powerCharging = false;
        this.chargeStartTime = 0;

        this.aimingStartTime = 0;
        this.resultMessageShown = false;
        this.shotResolved = false;

        this.pendingResult = null;
        this.pendingMessage = '';
        this.pendingMessageType = '';
        this.lastShotPower = 0;

        this.state = STATES.READY;
        this.message = '';
        this.messageTimer = 0;
    }

    _nextShot() {
        this.shots++;
        if (this.shots >= this.maxShots) {
            this.state = STATES.GAME_OVER;
            setTimeout(() => this._showFinalResults(), 50);
            return;
        }
        this._resetShot();
    }

    _showMessage(text, type, duration) {
        this.message = text;
        this.messageType = type;
        this.messageTimer = Date.now() + (duration || 1500);
    }

    _displayResultMessage() {
        this._showMessage(this.pendingMessage, this.pendingMessageType, GAME_SETTINGS.resultDelayMs);
    }

    _getZone(x) {
        const third = GAME_SETTINGS.goalWidth / 3;
        const relX = x - GAME_SETTINGS.goalLeft;
        if (relX < third) return 'left';
        if (relX < third * 2) return 'center';
        return 'right';
    }

    _update() {
        this.renderer.updateConfetti();

        if (this.state === STATES.RESULT) {
            this.ball.updateAnimation();
            this.goalkeeper.update();

            if (!this.ball.animating && !this.resultMessageShown) {
                this.resultMessageShown = true;
                this._displayResultMessage();
                if (this.pendingResult === 'goal' && this.lastShotPower > 0.85) {
                    this.renderer.startConfetti();
                }
            }

            if (this.resultMessageShown && Date.now() > this.messageTimer) {
                this._nextShot();
            }
            return;
        }

        if (this.state === STATES.GAME_OVER) return;

        if (Date.now() > this.messageTimer) {
            this.message = '';
        }

        switch (this.state) {
            case STATES.READY:
                this.player.updateRun();
                this.ball.x = this.player.x;
                this.ball.y = this.player.y + 30;
                if (this.player.keys.up) {
                    this.state = STATES.RUNNING;
                    this.countdownActive = true;
                    this.countdownTimer = performance.now();
                    audioManager.playWhistle();
                }
                break;

            case STATES.RUNNING:
                this.player.updateRun();
                this.ball.x = this.player.x;
                this.ball.y = this.player.y + 30;

                if (this.countdownActive) {
                    const elapsed = performance.now() - this.countdownTimer;
                    const interval = GAME_SETTINGS.countdownIntervalMs;
                    const newCountdown = 3 - Math.floor(elapsed / interval);

                    if (newCountdown !== this.countdown && newCountdown >= 0) {
                        this.countdown = newCountdown;
                        if (newCountdown > 0) {
                            audioManager._playTone(800, 0.08, 'sine', 0.3);
                        }
                    }

                    if (newCountdown <= 0) {
                        this.state = STATES.AIMING;
                        this.aimingStartTime = Date.now();
                        this.powerCharging = false;
                        this.power = 0;
                        this.player.resetAim();
                        audioManager._playTone(600, 0.15, 'square', 0.3);
                        this.countdownActive = false;
                    }
                }
                break;

            case STATES.AIMING:
                this.player.updateAim();
                this.ball.x = this.player.x;
                this.ball.y = this.player.y + 30;

                if (Date.now() - this.aimingStartTime > GAME_SETTINGS.aimingTimeLimit) {
                    this._resolveShot(this.player.aimX, this.player.aimY, 0);
                    break;
                }

                if (this.player.keys.space) {
                    if (!this.powerCharging) {
                        this.powerCharging = true;
                        this.chargeStartTime = performance.now();
                        this.power = 0;
                    }
                    const elapsed = (performance.now() - this.chargeStartTime) / 1000;
                    this.power = (Math.sin(elapsed * GAME_SETTINGS.powerOscillateSpeed) + 1) / 2;
                } else if (this.powerCharging) {
                    if (performance.now() - this.chargeStartTime >= GAME_SETTINGS.minChargeMs) {
                        audioManager.playKick();
                        this._resolveShot(this.player.aimX, this.player.aimY, this.power);
                    }
                    this.powerCharging = false;
                    this.power = 0;
                }
                break;
        }
    }

    _resolveShot(aimX, aimY, power) {
        if (this.shotResolved) return;
        this.shotResolved = true;
        this.lastShotPower = power;

        const dispersion = GAME_SETTINGS.dispersionMinPx + power * GAME_SETTINGS.dispersionPowerFactor;
        const actualX = aimX + (Math.random() - 0.5) * dispersion * 2;
        const actualY = aimY + (Math.random() - 0.5) * dispersion * 2;

        const g = GAME_SETTINGS;

        let result;
        let msg;
        let msgType;
        let keeperDir = null;

        if (actualX < g.goalLeft || actualX > g.goalRight || actualY < g.goalTop || actualY > g.goalBottom) {
            if (actualX < g.goalLeft) msg = 'LEFT POST!';
            else if (actualX > g.goalRight) msg = 'RIGHT POST!';
            else if (actualY < g.goalTop) msg = 'OVER THE BAR!';
            else msg = 'WIDE!';
            result = 'miss';
            msgType = 'miss';
        } else {
            keeperDir = this.goalkeeper.chooseDirection();
            this.goalkeeper.dive(keeperDir);
            this.goalkeeper.learnFromShot(aimX);

            if (this.goalkeeper.isSaved(actualX, actualY, power)) {
                const dirName = keeperDir.charAt(0).toUpperCase() + keeperDir.slice(1);
                msg = `SAVED! Keeper: ${dirName}`;
                result = 'saved';
                msgType = 'save';
            } else {
                this.score++;
                msg = 'GOAL!';
                result = 'goal';
                msgType = 'goal';
            }
        }

        const ballDuration = result === 'miss'
            ? GAME_SETTINGS.ballAnimMs * 0.6
            : GAME_SETTINGS.ballAnimMs;

        if (result === 'miss') {
            const missX = Math.max(g.goalLeft - 40, Math.min(g.goalRight + 40, actualX));
            const missY = Math.max(g.goalTop - 40, Math.min(g.goalBottom + 40, actualY));
            this.ball.startAnimation(missX, missY, ballDuration);
        } else {
            this.ball.startAnimation(actualX, actualY, ballDuration);
        }

        this.pendingResult = result;
        this.pendingMessage = msg;
        this.pendingMessageType = msgType;
        this.resultMessageShown = false;

        const powerZone = this._getZone(aimX);
        const dirSymbols = { left: '←', right: '→', center: '—' };

        this.shotHistory.push({
            shot: this.shots + 1,
            result: result,
            power: Math.round(power * 100),
            keeperDir: keeperDir,
            aimZone: powerZone,
            aimZoneSymbol: dirSymbols[powerZone],
            keeperSymbol: keeperDir ? dirSymbols[keeperDir] : '-'
        });

        this.state = STATES.RESULT;
    }

    _showFinalResults() {
        const gameOver = document.getElementById('game-over');
        const resultTitle = document.getElementById('result-title');
        const finalScore = document.getElementById('final-score');
        const shotDetails = document.getElementById('shot-details');

        if (!gameOver) return;

        resultTitle.textContent = this.score >= GAME_SETTINGS.winScore ? 'YOU WIN!' : 'YOU LOSE!';
        finalScore.textContent = `Goals: ${this.score} / ${this.maxShots}`;

        let detailsHTML = '<table class="shot-table"><tr><th>#</th><th>Result</th><th>Power</th><th>Keeper</th><th>Aim</th></tr>';
        this.shotHistory.forEach((shot) => {
            const resultClass = shot.result === 'goal' ? 'goal-row' : 'fail-row';
            const powerStr = shot.power + '%';
            const keeperStr = shot.keeperSymbol || '-';
            detailsHTML += `<tr class="${resultClass}">
                <td>${shot.shot}</td>
                <td>${shot.result.toUpperCase()}</td>
                <td>${powerStr}</td>
                <td>${keeperStr}</td>
                <td>${shot.aimZoneSymbol}</td>
            </tr>`;
        });
        detailsHTML += '</table>';
        shotDetails.innerHTML = detailsHTML;

        gameOver.style.display = 'flex';

        if (this.score >= this.maxShots) {
            const scrollOverlay = document.getElementById('scroll-overlay');
            const scrollText = document.getElementById('scroll-text');
            if (scrollOverlay && scrollText) {
                scrollText.textContent = 'Dear Gamer, this ancient scroll decrees that you are the greatest Gamer that has ever lived, and no one will ever come close to your levels of precision. His mighty one, Roary Cub Tallack, decrees that Unc still, in fact, has \'got it\'. May your reign never end. Kind regards, the Tootball Tooter Gods.';
                scrollOverlay.style.display = 'flex';
            }
        }
    }

    _render() {
        this.renderer.clear();
        this.renderer.drawPitch();
        this.renderer.drawGoal();

        if (this.player.tigerData) {
            this.renderer.drawTiger(this.player.x, this.player.y, this.player.size, this.player.tigerData);
        }

        this.renderer.drawGoalkeeper(this.goalkeeper.x, this.goalkeeper.y, this.goalkeeper.size, this.goalkeeper.diveDirection);

        this.renderer.drawBall(this.ball.x, this.ball.y, this.ball.size);

        this.renderer.drawUI(this.score, this.shots, this.maxShots, this.message, this.messageType);
        this.renderer.drawControls();
        this.renderer.drawConfetti();

        if (this.state === STATES.READY) {
            this._drawPrompt('PRESS ↑ TO RUN FORWARD');
        } else if (this.state === STATES.RUNNING && this.countdown > 0) {
            this._drawCountdown();
        } else if (this.state === STATES.AIMING) {
            this.renderer.drawCrosshair(this.player.aimX, this.player.aimY);
            if (this.powerCharging) {
                this.renderer.drawPowerBar(this.w / 2, this.h - 30, this.power, true);
                this._drawPromptAt('RELEASE SPACE TO SHOOT!', this.h - 70);
            } else {
                this._drawPrompt('AIM: ← → ↑ ↓    HOLD SPACE TO CHARGE');
            }
        }
    }

    _drawPrompt(text) {
        const ctx = this.renderer.ctx;
        const alpha = 0.5 + 0.5 * Math.sin(performance.now() / 300);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, this.w / 2, this.h - 40);
        ctx.restore();
    }

    _drawPromptAt(text, y) {
        const ctx = this.renderer.ctx;
        const alpha = 0.5 + 0.5 * Math.sin(performance.now() / 300);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, this.w / 2, y);
        ctx.restore();
    }

    _drawCountdown() {
        const ctx = this.renderer.ctx;
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.countdown, this.w / 2, this.h / 2);
        ctx.restore();
    }
}
