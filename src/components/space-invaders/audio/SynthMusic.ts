import type { AudioManager } from "./AudioManager";

const BPM = 120;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

const BASS_NOTES = [55, 55, 73.4, 65.4];
const ARP_NOTES = [
    [220, 330, 440, 330],
    [220, 330, 440, 330],
    [293, 440, 587, 440],
    [261, 392, 523, 392],
];

export class SynthMusic {
    private playing = false;
    private nextBarTime = 0;
    private barIndex = 0;
    private scheduledSources: (OscillatorNode | AudioBufferSourceNode)[] = [];

    constructor(private audio: AudioManager) {}

    start() {
        if (this.playing) return;
        const ctx = this.audio.ctx;
        if (!ctx) return;
        this.playing = true;
        this.nextBarTime = ctx.currentTime + 0.1;
        this.barIndex = 0;
        this.scheduleAhead();
    }

    stop() {
        this.playing = false;
        for (const src of this.scheduledSources) {
            try {
                src.stop();
            } catch {}
        }
        this.scheduledSources = [];
    }

    update() {
        if (!this.playing) return;
        const ctx = this.audio.ctx;
        if (!ctx) return;
        if (ctx.currentTime > this.nextBarTime - BAR) {
            this.scheduleAhead();
        }
    }

    private scheduleAhead() {
        const ctx = this.audio.ctx;
        const dest = this.audio.masterGain;
        if (!ctx || !dest) return;

        const barStart = this.nextBarTime;
        const bi = this.barIndex % 4;

        this.scheduleBass(ctx, dest, barStart, BASS_NOTES[bi]);
        this.scheduleArp(ctx, dest, barStart, ARP_NOTES[bi]);
        this.schedulePad(ctx, dest, barStart, BASS_NOTES[bi] * 2);
        this.scheduleKick(ctx, dest, barStart);
        this.scheduleHihat(ctx, dest, barStart);

        this.nextBarTime += BAR;
        this.barIndex++;
    }

    private scheduleBass(
        ctx: AudioContext,
        dest: AudioNode,
        start: number,
        freq: number,
    ) {
        for (let i = 0; i < 4; i++) {
            const t = start + i * BEAT;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + BEAT * 0.8);

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 300;

            osc.connect(filter).connect(gain).connect(dest);
            osc.start(t);
            osc.stop(t + BEAT);
            this.scheduledSources.push(osc);
        }
    }

    private scheduleArp(
        ctx: AudioContext,
        dest: AudioNode,
        start: number,
        notes: number[],
    ) {
        const step = BEAT / 2;
        for (let i = 0; i < 8; i++) {
            const t = start + i * step;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.value = notes[i % notes.length];
            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + step * 0.8);
            osc.connect(gain).connect(dest);
            osc.start(t);
            osc.stop(t + step);
            this.scheduledSources.push(osc);
        }
    }

    private schedulePad(
        ctx: AudioContext,
        dest: AudioNode,
        start: number,
        freq: number,
    ) {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sawtooth";
        osc2.type = "sawtooth";
        osc1.frequency.value = freq;
        osc2.frequency.value = freq * 1.005;
        gain.gain.setValueAtTime(0.02, start);
        gain.gain.setValueAtTime(0.02, start + BAR - 0.05);
        gain.gain.linearRampToValueAtTime(0, start + BAR);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain).connect(dest);
        osc1.start(start);
        osc2.start(start);
        osc1.stop(start + BAR);
        osc2.stop(start + BAR);
        this.scheduledSources.push(osc1, osc2);
    }

    private scheduleKick(ctx: AudioContext, dest: AudioNode, start: number) {
        for (let i = 0; i < 4; i++) {
            const t = start + i * BEAT;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain).connect(dest);
            osc.start(t);
            osc.stop(t + 0.2);
            this.scheduledSources.push(osc);
        }
    }

    private scheduleHihat(ctx: AudioContext, dest: AudioNode, start: number) {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const step = BEAT / 2;
        for (let i = 0; i < 8; i++) {
            const t = start + i * step;
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            const gain = ctx.createGain();
            const vol = i % 2 === 0 ? 0.04 : 0.02;
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            const hp = ctx.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.value = 8000;

            src.connect(hp).connect(gain).connect(dest);
            src.start(t);
            src.stop(t + 0.05);
            this.scheduledSources.push(src);
        }
    }
}
