document.addEventListener('DOMContentLoaded', () => {
    const tigerGrid = document.getElementById('tiger-grid');
    const startBtn = document.getElementById('start-btn');
    const normalBtn = document.getElementById('normal-btn');
    const hardBtn = document.getElementById('hard-btn');
    const modeDesc = document.getElementById('mode-desc');
    let selectedTiger = null;
    let selectedMode = 'normal';

    const modeDescriptions = {
        normal: 'Arrow shows LEFT or RIGHT. Shoot the opposite way!',
        hard: 'Arrow can show LEFT, RIGHT, or UP. Up arrow = center shot!'
    };

    normalBtn.addEventListener('click', () => {
        selectedMode = 'normal';
        normalBtn.classList.add('selected');
        hardBtn.classList.remove('selected');
        modeDesc.textContent = modeDescriptions.normal;
    });

    hardBtn.addEventListener('click', () => {
        selectedMode = 'hard';
        hardBtn.classList.add('selected');
        normalBtn.classList.remove('selected');
        modeDesc.textContent = modeDescriptions.hard;
    });

    TIGERS.forEach((tiger) => {
        const card = document.createElement('div');
        card.className = 'tiger-card';
        card.dataset.id = tiger.id;

        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#2d8c2d';
        ctx.fillRect(0, 0, 120, 140);

        drawTigerPreview(ctx, 60, 80, 1.5, tiger);

        const name = document.createElement('div');
        name.className = 'tiger-name';
        name.textContent = tiger.name;

        card.appendChild(canvas);
        card.appendChild(name);

        card.addEventListener('click', () => {
            document.querySelectorAll('.tiger-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTiger = tiger;
            startBtn.disabled = false;
        });

        tigerGrid.appendChild(card);
    });

    startBtn.addEventListener('click', () => {
        if (!selectedTiger) return;
        localStorage.setItem('selectedTiger', JSON.stringify(selectedTiger));
        localStorage.setItem('gameMode', selectedMode);
        window.location.href = 'instructions.html';
    });

    function drawTigerPreview(ctx, x, y, scale, tigerData) {
        const drawPixelRect = (px, py, pw, ph, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x + px * scale, y + py * scale, pw * scale, ph * scale);
        };

        drawPixelRect(-8, -25, 16, 16, tigerData.color);
        drawPixelRect(-6, -23, 12, 12, tigerData.noseColor);

        drawPixelRect(-4, -21, 2, 2, '#000');
        drawPixelRect(2, -21, 2, 2, '#000');
        drawPixelRect(-1, -17, 2, 2, tigerData.stripeColor);
        drawPixelRect(-1, -15, 2, 1, '#FF6B6B');

        drawPixelRect(-10, -27, 4, 4, tigerData.color);
        drawPixelRect(6, -27, 4, 4, tigerData.color);

        drawPixelRect(-5, -9, 10, 18, tigerData.color);
        drawPixelRect(-4, -6, 2, 12, tigerData.stripeColor);
        drawPixelRect(1, -4, 2, 10, tigerData.stripeColor);

        drawPixelRect(-7, 9, 5, 10, tigerData.color);
        drawPixelRect(2, 9, 5, 10, tigerData.color);
        drawPixelRect(-6, 9, 3, 8, tigerData.stripeColor);
        drawPixelRect(3, 9, 3, 8, tigerData.stripeColor);

        drawPixelRect(5, -4, 8, 5, tigerData.color);
        drawPixelRect(8, -3, 3, 3, tigerData.stripeColor);
    }
});
