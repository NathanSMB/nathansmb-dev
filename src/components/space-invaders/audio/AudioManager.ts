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
