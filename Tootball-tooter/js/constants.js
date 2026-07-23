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
    timingToleranceMs: 30,
    hardTimingToleranceMs: 15,
    goalkeeperRevealTimeMs: 800,
    goalkeeperDiveTimeMs: 400,
    ballSpeed: 12,
    runSpeed: 1.5,
    moveSpeed: 4,
    countdownIntervalMs: 600,
    canvasWidth: 800,
    canvasHeight: 600,
    goalWidth: 300,
    goalHeight: 120,
    goalY: 80,
    penaltySpotY: 480,
    groundY: 520,
    hardMode: true
};

const STATES = {
    READY: 'ready',
    RUNNING: 'running',
    SHOOTING: 'shooting',
    RESULT: 'result',
    GAME_OVER: 'game_over'
};
