const TIGERS = [
    { id: 'roary', name: 'Roary', color: '#FF8C00', stripeColor: '#CC7000', noseColor: '#FFB366' },
    { id: 'atlas', name: 'Atlas', color: '#4169E1', stripeColor: '#2850B8', noseColor: '#6B8EFF' },
    { id: 'sege', name: 'Sege', color: '#32CD32', stripeColor: '#28A428', noseColor: '#5FFF5F' },
    { id: 'nessie', name: 'Nessie', color: '#9370DB', stripeColor: '#7050B0', noseColor: '#B09FFF' },
    { id: 'telix', name: 'Telix', color: '#DC143C', stripeColor: '#B01030', noseColor: '#FF4060' }
];

const GAME_SETTINGS = {
    shotsPerRound: 5,
    winScore: 5,
    canvasWidth: 800,
    canvasHeight: 600,
    goalWidth: 300,
    goalHeight: 120,
    goalY: 80,
    penaltySpotY: 480,
    groundY: 520,
    hardMode: false,

    goalLeft: (800 - 300) / 2,
    goalRight: (800 + 300) / 2,
    goalTop: 80,
    goalBottom: 200,
    goalCenterX: 400,
    goalCenterY: 140,

    runSpeed: 1.5,
    strafeSpeed: 3,

    aimAccel: 0.45,
    aimFriction: 0.88,
    aimMaxSpeed: 3.5,
    aimJitter: 0.4,

    powerOscillateSpeed: 5.5,
    aimingTimeLimit: 4000,
    minChargeMs: 80,

    keeperReachH: 75,
    keeperReachV: 50,
    keeperPowerReachFactor: 1.5,
    keeperDiveDist: 100,
    keeperLearningRate: 0.35,
    keeperNoise: 0.2,

    dispersionMinPx: 3,
    dispersionPowerFactor: 6,

    ballAnimMs: 320,
    resultDelayMs: 1800,
    countdownIntervalMs: 600,
};

const STATES = {
    READY: 'ready',
    RUNNING: 'running',
    AIMING: 'aiming',
    RESULT: 'result',
    GAME_OVER: 'game_over'
};
