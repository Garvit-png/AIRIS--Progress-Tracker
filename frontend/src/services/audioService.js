/**
 * AIRIS System Audio Service (v7 - Minimalist Simple Reversion)
 * Generates clean, functional, non-intrusive minimalist sounds.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.hum = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.connect(this.ctx.destination);
        }
    }

    startAmbience() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;

        // 1. Pure Sine Hum (Stable, non-intrusive background)
        this.hum = this.ctx.createOscillator();
        const humGain = this.ctx.createGain();

        this.hum.type = 'sine';
        this.hum.frequency.setValueAtTime(55, now); // Low A

        humGain.gain.setValueAtTime(0, now);
        humGain.gain.linearRampToValueAtTime(0.08, now + 1); // Soft presence

        this.hum.connect(humGain);
        humGain.connect(this.master);
        this.hum.start();

        this.humNodes = { osc: this.hum, gain: humGain };

        // Master fade in
        this.master.gain.setValueAtTime(0, now);
        this.master.gain.linearRampToValueAtTime(1, now + 0.5);

        console.log('[Audio] Minimalist Engine Engaged');
    }

    // No sweeps or pitch shifts for the simple version
    updateSweep() {
        // Keeping the interface consistent but logic empty for simplicity
        // This ensures the LoaderScreen.jsx doesn't break
    }

    // Pure Sine Tick (Clean acoustic beep)
    playDataTick() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // Pure high A

        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        osc.connect(g);
        g.connect(this.master);

        osc.start();
        osc.stop(now + 0.05);
    }

    stopAmbience() {
        if (this.master) {
            const now = this.ctx.currentTime;
            this.master.gain.linearRampToValueAtTime(0, now + 0.5);
            setTimeout(() => {
                if (this.humNodes) this.humNodes.osc.stop();
                console.log('[Audio] Minimalist Engine Disengaged');
            }, 500);
        }
    }
}

export const SystemAudio = new AudioEngine();
