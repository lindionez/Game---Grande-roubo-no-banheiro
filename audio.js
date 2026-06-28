class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        
        this.volBgm = 0.15;
        this.volSfx = 0.5;
        
        this.bgmOsc = null;
        this.bgmGain = null;
        
        this.chaseOsc = null;
        this.chaseGain = null;
        this.isChasing = false;
        this.heartbeatTimer = 0;
        
        this.lastStepTime = 0;
        this.lastDonaStep = 0;
        this.bgmTimer = 0;
        this.isMuted = false;
    }

    init() {
        if(this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1;
        this.masterGain.connect(this.ctx.destination);
    }
    
    toggleMute() {
        if(!this.initialized) return false;
        this.isMuted = !this.isMuted;
        this.masterGain.gain.value = this.isMuted ? 0 : 1;
        return this.isMuted;
    }

    setChase(active) {
        if(!this.initialized || this.isChasing === active) return;
        this.isChasing = active;
        if(!active) {
            this.playTone(300, 'sine', 0.5, 0.5); // uhf alívio
        }
    }

    updateHeartbeat(distToPlayer, dt) {
        if(!this.isChasing || !this.initialized) return;
        this.heartbeatTimer += dt;
        let rate = 1.0;
        if(distToPlayer < 80) rate = 0.25;
        else if(distToPlayer < 200) rate = 0.5;
        
        if(this.heartbeatTimer >= rate) {
            this.heartbeatTimer = 0;
            this.playTone(50, 'sine', 0.3, 0.6); // heartbeat thump
            setTimeout(() => this.playTone(45, 'sine', 0.3, 0.4), 100);
        }
    }

    playNoise(duration, vol, type='white') {
        if(!this.initialized) return;
        let bufferSize = this.ctx.sampleRate * duration;
        let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        let noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        let filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = type === 'step' ? 400 : 1000;
        
        let gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol * this.volSfx, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    playTone(freq, type, duration, vol, glideTo = null, destNode = null) {
        if(!this.initialized) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if(glideTo) {
            osc.frequency.exponentialRampToValueAtTime(glideTo, this.ctx.currentTime + duration);
        }
        
        gain.gain.setValueAtTime(vol * this.volSfx, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(destNode || this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }


    collectPanty(isRare = false) {
        this.playTone(600, 'sine', 0.1, 0.5, 1200);
        if(isRare) setTimeout(() => this.playTone(1200, 'sine', 0.2, 0.5, 1800), 100);
    }
    
    collectTrap() {
        this.playTone(200, 'sawtooth', 0.5, 0.8, 100);
    }

    batherHmm() {
        if(!this.initialized) return;
        let now = this.ctx.currentTime;
        if(this.lastHmmTime && now - this.lastHmmTime < 1.0) return;
        this.lastHmmTime = now;
        this.playTone(300, 'triangle', 0.3, 0.2, 400);
    }

    batherScream() {
        if(!this.initialized) return;
        let now = this.ctx.currentTime;
        if(this.lastScreamTime && now - this.lastScreamTime < 1.5) return;
        this.lastScreamTime = now;
        
        // High pitch noise + tone
        this.playTone(800, 'sawtooth', 0.8, 0.15, 1200);
        this.playNoise(0.8, 0.1);
    }

    donaAlert() {
        this.playTone(200, 'sawtooth', 0.4, 0.7, 150);
    }

    donaMad() {
        this.playTone(150, 'sawtooth', 0.8, 0.8, 100);
        this.playNoise(0.8, 0.5);
    }
    
    ak47Shoot() {
        this.playNoise(0.2, 0.9); // BANG
        this.playTone(100, 'square', 0.2, 0.7, 40);
    }

    win() {
        this.playTone(400, 'square', 0.2, 0.6);
        setTimeout(() => this.playTone(500, 'square', 0.2, 0.6), 200);
        setTimeout(() => this.playTone(600, 'square', 0.4, 0.6), 400);
    }

    gameOver() {
        this.playTone(300, 'sawtooth', 0.4, 0.7, 100);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.6, 0.7, 50), 400);
    }

    enemyHit() {
        if(!this.initialized) return;
        this.playTone(80, 'sawtooth', 0.1, 0.7);
        this.playNoise(0.1, 1.0, 'step'); 
    }

    ak47VictoryShoot() {
        if(!this.initialized) return;
        this.playNoise(0.1, 0.3); 
        this.playTone(80, 'square', 0.1, 0.2, 40);
    }


    buyUpgrade() {
        this.playTone(1200, 'sine', 0.1, 0.5, 2000);
    }

    beep(urgency) { // 1 = low, 2 = med, 3 = high
        let freq = urgency === 3 ? 600 : (urgency === 2 ? 400 : 300);
        let dur = urgency === 3 ? 0.3 : 0.1;
        this.playTone(freq, 'square', dur, 0.4);
    }
}

window.audioMgr = new AudioManager();
