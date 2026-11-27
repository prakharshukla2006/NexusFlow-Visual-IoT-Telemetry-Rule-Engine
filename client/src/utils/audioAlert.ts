/**
 * Industrial SCADA Alarm Synthesizer using Web Audio API
 * Generates pure tone beeps for critical threshold alerts without external audio files.
 */

class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true; // Enabled by default in SCADA environments

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Initializes or resumes the AudioContext safely within modern browser autoplay policies.
   */
  private async getOrCreateContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      return this.audioCtx;
    } catch (e) {
      console.warn('[WebAudio] Failed to initialize AudioContext:', e);
      return null;
    }
  }

  /**
   * Plays the critical industrial two-tone siren (880Hz -> 1175Hz).
   * @param force If true, bypasses the isEnabled flag (for explicit user tests)
   */
  public async playCriticalAlarm(force: boolean = false): Promise<boolean> {
    if (!this.isEnabled && !force) return false;

    try {
      const ctx = await this.getOrCreateContext();
      if (!ctx) return false;

      const now = ctx.currentTime;

      // Pulse 1: 880 Hz (A5 tone)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);

      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.005, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.16);

      // Pulse 2: 1175 Hz (D6 tone) - Industrial high-urgency secondary pulse
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(1174.66, now + 0.18);

      gain2.gain.setValueAtTime(0.25, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.005, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.18);
      osc2.stop(now + 0.38);

      return true;
    } catch (e) {
      console.warn('[WebAudio] Playback error in playCriticalAlarm:', e);
      return false;
    }
  }

  /**
   * Dedicated method for test button triggers.
   * Unmutes service if needed and guarantees tone playback.
   */
  public async testAlarm(): Promise<boolean> {
    this.isEnabled = true;
    return await this.playCriticalAlarm(true);
  }

  /**
   * Plays a single warning chime (660 Hz) for mild anomalies.
   */
  public async playWarningBeep(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const ctx = await this.getOrCreateContext();
      if (!ctx) return false;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);

      return true;
    } catch (e) {
      console.warn('[WebAudio] Playback error in playWarningBeep:', e);
      return false;
    }
  }
}

export const audioAlert = new AudioAlertService();
