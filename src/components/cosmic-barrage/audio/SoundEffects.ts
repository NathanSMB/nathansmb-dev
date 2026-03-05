import type { AudioManager } from "./AudioManager";

export class SoundEffects {
    constructor(private audio: AudioManager) {}

    laser() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain).connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    hit() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain).connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }

    explosion() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(
            100,
            ctx.currentTime + 0.3,
        );

        noise.connect(filter).connect(gain).connect(dest);
        noise.start();
        noise.stop(ctx.currentTime + 0.3);
    }

    powerup() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.06;
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain).connect(dest);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    }

    shieldBreak() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(2000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain).connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }

    gameOver() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const notes = [440, 370, 311, 220];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.2;
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain).connect(dest);
            osc.start(t);
            osc.stop(t + 0.4);
        });
    }
}
