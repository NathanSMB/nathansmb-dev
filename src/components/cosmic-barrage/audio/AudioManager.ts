export class AudioManager {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    private _muted = false;

    init() {
        if (this.ctx) return;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx?.state === "suspended") {
            this.ctx.resume();
        }
    }

    /** Init + resume + play silent buffer to unlock on iOS. Returns true if running. */
    unlock(): boolean {
        this.init();
        this.resume();
        if (this.ctx) {
            const buf = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            src.connect(this.ctx.destination);
            src.start(0);
        }
        return this.ctx?.state === "running";
    }

    get muted() {
        return this._muted;
    }

    toggleMute() {
        this._muted = !this._muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this._muted ? 0 : 0.3;
        }
    }

    dispose() {
        this.ctx?.close();
        this.ctx = null;
        this.masterGain = null;
    }
}
