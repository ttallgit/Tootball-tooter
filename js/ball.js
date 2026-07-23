class Ball {
    constructor() {
        this.x = GAME_SETTINGS.canvasWidth / 2;
        this.y = GAME_SETTINGS.penaltySpotY + 30;
        this.size = 8;
    }

    reset(playerX) {
        this.x = playerX;
        this.y = GAME_SETTINGS.penaltySpotY + 30;
    }
}
