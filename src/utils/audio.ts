/**
 * Web Audio API synthesizer for desk dispatch announcements and queue alerts
 */

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  public soundEnabled: boolean = true;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Classic hospital / airport counter two-tone chime (F#5 -> C#5 -> A4)
   */
  playDeskChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Note 1
      this.playTone(ctx, 740, now, 0.45, 0.15); // F#5
      // Note 2
      this.playTone(ctx, 554.37, now + 0.22, 0.5, 0.18); // C#5
      // Note 3
      this.playTone(ctx, 440, now + 0.45, 0.7, 0.2); // A4
    } catch {
      // Audio might be blocked by browser policy until user gesture
    }
  }

  /**
   * Triumphant chime when customer's ticket is called to station
   */
  playYourTurnFanfare() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      this.playTone(ctx, 523.25, now, 0.25, 0.18); // C5
      this.playTone(ctx, 659.25, now + 0.15, 0.25, 0.2); // E5
      this.playTone(ctx, 783.99, now + 0.3, 0.3, 0.22); // G5
      this.playTone(ctx, 1046.50, now + 0.48, 0.8, 0.25); // C6
    } catch {
      // Ignore
    }
  }

  /**
   * Gentle tick / alert ping
   */
  playAlertPing() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      this.playTone(ctx, 880, now, 0.2, 0.12);
    } catch {
      // Ignore
    }
  }

  private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, gainVal: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundManager = new SoundSynthesizer();
