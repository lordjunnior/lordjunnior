/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume if suspended (browser security restriction on loaded audio contexts)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  playMove() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);
    
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.06);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.06);
  }

  playSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Classic 8-bit twin-pulse coin sound
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.11); // G5
    
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.setValueAtTime(0.03, now + 0.11);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.22);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.22);
  }

  playBack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Low sweeping buzz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.15);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.15);
  }
  
  playToggle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.setValueAtTime(480, now + 0.04);
    
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.09);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.09);
  }

  playSwap(systemId: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const isCdEra = ['ps1', 'playstation', 'ps2', 'playstation2', 'ps3', 'playstation3', 'saturn', 'dreamcast', '3do', 'xbox', 'xbox360', 'gamecube'].includes(systemId.toLowerCase());
    
    if (isCdEra) {
      // Sound of CD spinning up: quick upward frequency sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.22);
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.08);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.24);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } else {
      // "Clack" sound of a cartridge slotting in
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(70, now + 0.02);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.05);
    }
  }
}

export const soundEngine = new RetroSoundEngine();
