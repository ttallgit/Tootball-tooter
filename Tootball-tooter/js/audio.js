class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    }

    _playTone(freq, duration, type = 'sine', volume = 0.3) {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    _playNoise(duration, volume = 0.3) {
        if (!this.ctx) this.init();
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(this.ctx.currentTime);
    }

    playKick() {
        this._playNoise(0.15, 0.5);
        this._playTone(150, 0.1, 'sine', 0.4);
    }

    playGoal() {
        this._playTone(523, 0.15, 'sine', 0.3);
        setTimeout(() => this._playTone(659, 0.15, 'sine', 0.3), 100);
        setTimeout(() => this._playTone(784, 0.3, 'sine', 0.4), 200);
        setTimeout(() => this._playNoise(0.5, 0.2), 300);
    }

    playSave() {
        this._playTone(200, 0.2, 'square', 0.2);
        this._playNoise(0.1, 0.3);
    }

    playBoo() {
        this._playTone(300, 0.3, 'sawtooth', 0.15);
        setTimeout(() => this._playTone(250, 0.3, 'sawtooth', 0.15), 150);
        setTimeout(() => this._playTone(200, 0.4, 'sawtooth', 0.1), 300);
    }

    playWhistle() {
        this._playTone(880, 0.1, 'sine', 0.4);
        setTimeout(() => this._playTone(880, 0.1, 'sine', 0.4), 150);
        setTimeout(() => this._playTone(1100, 0.3, 'sine', 0.5), 300);
    }
}

const audioManager = new AudioManager();
