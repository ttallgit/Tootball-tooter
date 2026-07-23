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
        this.arrowShown = false;

        this.arrowDirection = null;
        this.arrowVisible = false;

        this.goalkeeperDiving = false;
        this.shotResult = null;
        this.shootWindowOpen = false;
        this.shotResolved = false;

        this.shotHistory = [];
        this.animationFrameId = null;
        this.shootWindowStart = 0;
        this.shootTimeLimit = 500;
    }

    start(tigerData) {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.player.setTiger(tigerData);
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
        this.arrowShown = false;

        this.arrowDirection = null;
        this.arrowVisible = false;

        this.goalkeeperDiving = false;
        this.shotResult = null;
        this.shootWindowOpen = false;
        this.shotResolved = false;

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

    _showMessage(text, type, duration = 1500) {
        this.message = text;
        this.messageType = type;
        this.messageTimer = Date.now() + duration;
    }

    _update() {
        this.renderer.updateConfetti();

        if (this.state === STATES.RESULT) {
            if (Date.now() > this.messageTimer) {
                this._nextShot();
            }
            return;
        }

        if (this.state === STATES.GAME_OVER) {
            return;
        }

        if (Date.now() > this.messageTimer) {
            this.message = '';
        }

        switch (this.state) {
            case STATES.READY:
                this.player.update();
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
                this.player.update();
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

                    const totalProgress = elapsed / (interval * 3);
                    if (totalProgress >= 0.83 && !this.arrowShown) {
                        this.arrowDirection = this.goalkeeper.revealDirection();
                        this.arrowVisible = true;
                        this.arrowShown = true;
                        audioManager._playTone(1200, 0.1, 'sine', 0.4);
                    }

                    if (newCountdown <= 0) {
                        this.state = STATES.SHOOTING;
                        this.shootWindowOpen = true;
                        this.shootWindowStart = Date.now();
                        this.countdownActive = false;
                        this.player.enableShooting();
                        audioManager._playTone(600, 0.15, 'square', 0.3);
                    }
                }
                break;

            case STATES.SHOOTING:
                if (!this.goalkeeperDiving) {
                    this.goalkeeperDiving = true;
                    this.goalkeeper.dive();
                }

                this.goalkeeper.update();

                if (this.shootWindowOpen && Date.now() - this.shootWindowStart > this.shootTimeLimit) {
                    const elapsed = Date.now() - this.shootWindowStart;
                    this._resolveShot({ timed: false, direction: null, tooLate: true, elapsed: elapsed });
                    break;
                }

                if (this.shootWindowOpen && this.player.keys.space && this.player.lastDirectionPress) {
                    const result = this.player.checkShotTiming();
                    this._resolveShot(result);
                }
                break;
        }
    }

    _resolveShot(result) {
        if (this.shotResolved) return;
        this.shotResolved = true;
        this.shootWindowOpen = false;

        let timingMs = Infinity;
        let signedTimingMs = 0;
        let tooEarly = false;
        if (result && result.direction) {
            const dirTime = this.player.lastDirectionPress ? this.player.lastDirectionPress.time : 0;
            const spaceTime = this.player.lastSpacePress || 0;
            signedTimingMs = dirTime - spaceTime;
            timingMs = Math.abs(signedTimingMs);
            tooEarly = signedTimingMs < 0;
        }

        const shotData = {
            shot: this.shots + 1,
            timed: result ? result.timed : false,
            direction: result ? result.direction : null,
            arrowDirection: this.arrowDirection,
            signedTimingMs: signedTimingMs,
            timingMs: timingMs,
            tooEarly: tooEarly,
            tooLate: result ? result.tooLate : false,
            elapsed: result ? result.elapsed : 0,
            result: 'miss'
        };

        if (!result || !result.timed) {
            let msg = 'MISTIMED! No direction pressed';
            if (result && result.tooLate) {
                msg = `TOO LATE! (+${Math.round(result.elapsed)}ms)`;
            } else if (result && result.direction && timingMs < 1000) {
                const dirSymbols = { left: '←', right: '→', down: '↓', up: '↑' };
                const dirSymbol = dirSymbols[result.direction] || result.direction;
                if (tooEarly) {
                    msg = `${dirSymbol} before SPACE! (${Math.round(signedTimingMs)}ms)`;
                } else {
                    msg = `SPACE before ${dirSymbol}! (+${Math.round(timingMs)}ms)`;
                }
            }
            audioManager.playBoo();
            this._showMessage(msg, 'save');
            shotData.result = 'mistimed';
            this.ball.x = this.player.x;
            this.ball.y = this.player.y + 30;
        } else {
            const isPerfect = Math.round(signedTimingMs) === 0;
            const timingStr = isPerfect ? 'PERFECT!' : `(${tooEarly ? '' : '+'}${Math.round(signedTimingMs)}ms)`;
            const opposite = { left: 'right', right: 'left', up: 'down' };
            if (result.direction === opposite[this.arrowDirection]) {
                this.score++;
                audioManager.playGoal();
                this._showMessage(`GOAL! ${timingStr}`, 'goal');
                shotData.result = 'goal';
                const goalCenterX = GAME_SETTINGS.canvasWidth / 2;
                if (result.direction === 'left') {
                    this.ball.x = goalCenterX - 100;
                } else if (result.direction === 'right') {
                    this.ball.x = goalCenterX + 100;
                } else {
                    this.ball.x = goalCenterX;
                }
                this.ball.y = GAME_SETTINGS.goalY + 60;
                if (isPerfect) {
                    this.renderer.startConfetti();
                }
            } else {
                audioManager.playSave();
                audioManager.playBoo();
                this._showMessage(`SAVED! ${timingStr}`, 'save');
                shotData.result = 'saved';
                this.ball.x = this.goalkeeper.x;
                this.ball.y = this.goalkeeper.y;
            }
        }

        this.shotHistory.push(shotData);
        this.state = STATES.RESULT;
        this.messageTimer = Date.now() + 1500;
    }

    _showFinalResults() {
        const gameOver = document.getElementById('game-over');
        const resultTitle = document.getElementById('result-title');
        const finalScore = document.getElementById('final-score');
        const shotDetails = document.getElementById('shot-details');

        if (!gameOver) return;

        resultTitle.textContent = this.score >= GAME_SETTINGS.winScore ? 'YOU WIN!' : 'YOU LOSE!';
        finalScore.textContent = `Goals: ${this.score} / ${this.maxShots}`;

        const dirSymbols = { left: '←', right: '→', down: '↓', up: '↑' };
        let detailsHTML = '<table class="shot-table"><tr><th>Shot</th><th>Result</th><th>Timing</th></tr>';
        this.shotHistory.forEach((shot) => {
            const resultClass = shot.result === 'goal' ? 'goal-row' : 'fail-row';
            let timingText = '-';
            if (shot.result === 'mistimed') {
                if (shot.tooLate) {
                    timingText = `Too late (+${Math.round(shot.elapsed || 0)}ms)`;
                } else if (shot.direction && shot.timingMs < 1000) {
                    const dirSymbol = dirSymbols[shot.direction] || shot.direction;
                    if (shot.tooEarly) {
                        timingText = `${dirSymbol} before SPACE! (${Math.round(shot.signedTimingMs)}ms)`;
                    } else {
                        timingText = `SPACE before ${dirSymbol}! (+${Math.round(shot.timingMs)}ms)`;
                    }
                } else {
                    timingText = 'No input';
                }
            } else if (Math.round(shot.signedTimingMs) === 0) {
                timingText = 'PERFECT!';
            } else if (shot.timingMs !== Infinity && shot.timingMs !== undefined) {
                const sign = shot.tooEarly ? '' : '+';
                timingText = `${sign}${Math.round(shot.signedTimingMs)}ms`;
            }
            detailsHTML += `<tr class="${resultClass}">
                <td>${shot.shot}</td>
                <td>${shot.result.toUpperCase().replace('_', ' ')}</td>
                <td>${timingText}</td>
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

        if (this.arrowVisible) {
            const arrowPos = this.goalkeeper.getArrowPosition();
            this.renderer.drawArrow(this.arrowDirection, arrowPos.x, arrowPos.y, true);
        }

        this.renderer.drawGoalkeeper(this.goalkeeper.x, this.goalkeeper.y, this.goalkeeper.size, this.goalkeeper.diveDirection);

        if (this.player.tigerData) {
            this.renderer.drawTiger(this.player.x, this.player.y, this.player.size, this.player.tigerData);
        }

        this.renderer.drawBall(this.ball.x, this.ball.y, this.ball.size);

        this.renderer.drawUI(this.score, this.shots, this.maxShots, this.message, this.messageType);
        this.renderer.drawControls();
        this.renderer.drawConfetti();

        if (this.state === STATES.READY) {
            this._drawPrompt('PRESS ↑ TO RUN FORWARD');
        } else if (this.state === STATES.RUNNING && this.countdown > 0) {
            this._drawCountdown();
        } else if (this.state === STATES.SHOOTING && this.shootWindowOpen) {
            const elapsed = Date.now() - this.shootWindowStart;
            const progress = Math.max(0, 1 - (elapsed / this.shootTimeLimit));
            this.renderer.drawShootTimer(progress);
            const shootPrompt = GAME_SETTINGS.hardMode ? '← ↓ → + SPACE NOW!' : '← OR → + SPACE NOW!';
            this._drawPrompt(shootPrompt);
        }
    }

    _drawPrompt(text) {
        const ctx = this.renderer.ctx;
        const alpha = 0.5 + 0.5 * Math.sin(performance.now() / 300);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, GAME_SETTINGS.canvasWidth / 2, GAME_SETTINGS.canvasHeight - 40);
        ctx.restore();
    }

    _drawCountdown() {
        const ctx = this.renderer.ctx;
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.countdown, GAME_SETTINGS.canvasWidth / 2, GAME_SETTINGS.canvasHeight / 2);
        ctx.restore();
    }
}
