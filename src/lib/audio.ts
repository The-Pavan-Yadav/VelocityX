class AudioManager {
    ctx: AudioContext | null = null;
    muted: boolean = false;
    masterGain: GainNode | null = null;

    pingInterval: number | null = null;
    dlOsc: OscillatorNode | null = null;
    dlFilter: BiquadFilterNode | null = null;
    dlGain: GainNode | null = null;
    
    ulOsc: OscillatorNode | null = null;
    ulGain: GainNode | null = null;

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.updateMute();
        }
    }
    
    setMuted(m: boolean) {
        this.muted = m;
        this.updateMute();
    }

    updateMute() {
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime, 0.1);
        }
    }
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playHover() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playClick() {
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playStart() {
        if (!this.ctx || this.muted) return;
        
        // Deep bass activation
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.5);
        
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);

        // Energy charge riser
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.masterGain!);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(50, this.ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 1.5);
        
        gain2.gain.setValueAtTime(0, this.ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1.0);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

        osc2.start();
        osc2.stop(this.ctx.currentTime + 1.5);
    }

    startPing() {
        if (!this.ctx || this.muted) return;
        const playPulse = () => {
            if (this.muted || !this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain!);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        };
        
        playPulse();
        this.pingInterval = window.setInterval(playPulse, 600);
    }

    stopPing() {
        if (this.pingInterval) clearInterval(this.pingInterval);
    }

    startDownload() {
        if (!this.ctx || this.muted) return;
        this.dlOsc = this.ctx.createOscillator();
        this.dlGain = this.ctx.createGain();
        this.dlFilter = this.ctx.createBiquadFilter();
        
        this.dlOsc.type = 'sawtooth';
        this.dlOsc.frequency.setValueAtTime(50, this.ctx.currentTime);
        
        this.dlFilter.type = 'lowpass';
        this.dlFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
        
        this.dlGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.dlGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.5);
        
        this.dlOsc.connect(this.dlFilter);
        this.dlFilter.connect(this.dlGain);
        this.dlGain.connect(this.masterGain!);
        
        this.dlOsc.start();
    }
    
    updateDownload(speed: number, maxSpeed: number = 1000) {
        if (!this.ctx || !this.dlOsc || !this.dlFilter) return;
        const ratio = Math.min(speed / maxSpeed, 1);
        const cFreq = 50 + ratio * 300;
        const fFreq = 200 + ratio * 2000;
        
        this.dlOsc.frequency.setTargetAtTime(cFreq, this.ctx.currentTime, 0.1);
        this.dlFilter.frequency.setTargetAtTime(fFreq, this.ctx.currentTime, 0.1);
    }

    stopDownload() {
        if (!this.ctx || !this.dlGain || !this.dlOsc) return;
        this.dlGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        this.dlOsc.stop(this.ctx.currentTime + 0.5);
    }

    startUpload() {
        if (!this.ctx || this.muted) return;
        this.ulOsc = this.ctx.createOscillator();
        this.ulGain = this.ctx.createGain();
        
        this.ulOsc.type = 'square';
        this.ulOsc.frequency.setValueAtTime(150, this.ctx.currentTime);
        
        this.ulGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.ulGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.5);
        
        this.ulOsc.connect(this.ulGain);
        this.ulGain.connect(this.masterGain!);
        
        this.ulOsc.start();
    }
    
    updateUpload(speed: number, maxSpeed: number = 1000) {
        if (!this.ctx || !this.ulOsc) return;
        const ratio = Math.min(speed / maxSpeed, 1);
        const cFreq = 150 + ratio * 400;
        this.ulOsc.frequency.setTargetAtTime(cFreq, this.ctx.currentTime, 0.1);
    }

    stopUpload() {
        if (!this.ctx || !this.ulGain || !this.ulOsc) return;
        this.ulGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        this.ulOsc.stop(this.ctx.currentTime + 0.5);
    }

    playWarp() {
        if (!this.ctx || this.muted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 1.5);
        
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }

    playResult() {
        if (!this.ctx || this.muted) return;
        
        const freqs = [392.00, 493.88, 587.33, 739.99]; // Gmaj7
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain!);
            
            osc.type = 'sine';
            osc.frequency.value = f;
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1 + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 2.5);
        });
    }
}

export const audio = new AudioManager();
