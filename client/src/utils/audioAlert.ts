/**
 * Industrial SCADA Alarm Synthesizer using Web Audio API
 * Generates pure tone beeps for critical threshold alerts without external audio files.
 */

class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = false;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public playCriticalAlarm() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Industrial two-tone alert
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, this.audioCtx.currentTime + 0.12); // D6

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }
}

export const audioAlert = new AudioAlertService();
