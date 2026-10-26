/**
 * Procedural Web Audio Engine for Antique Typewriter & Atmospheric Library
 * No external audio files needed; instantaneous response & authentic acoustics.
 */

class AtelierAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  public isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playKeyClick(char: string = 'a') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Vary pitch slightly based on character code so each key has personality
    const charCode = char.charCodeAt(0) || 65;
    const pitchOffset = ((charCode % 12) - 6) * 18;
    const baseFreq = 420 + pitchOffset;

    // 1. Mechanical snap (high transient)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(baseFreq * 2.2, t);
    snapOsc.frequency.exponentialRampToValueAtTime(110, t + 0.04);
    
    snapGain.gain.setValueAtTime(0.35, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.05);

    // 2. Heavy iron typewriter body thud
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(140 + (charCode % 5) * 8, t);
    thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.06);

    thudGain.gain.setValueAtTime(0.4, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(t);
    thudOsc.stop(t + 0.08);

    // 3. Metallic friction noise
    this.playBurstNoise(0.025, 0.15, 1200);
  }

  public playSpacebar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Lower, deeper mechanical thud of the solid wooden/brass spacebar linkage
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);

    this.playBurstNoise(0.04, 0.12, 800);
  }

  public playCarriageReturn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Series of quick mechanical ratchet clicks followed by the carriage slide
    const clicks = 5;
    for (let i = 0; i < clicks; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + i * 60, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.02);
      }, i * 35);
    }
  }

  public playBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // High brass typewriter margin bell chime (approx 1850 Hz with warm overtone)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1860, t);

    const overtoneOsc = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(3720, t);

    bellGain.gain.setValueAtTime(0.3, t);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    overtoneGain.gain.setValueAtTime(0.12, t);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    bellOsc.connect(bellGain);
    overtoneOsc.connect(overtoneGain);
    bellGain.connect(this.ctx.destination);
    overtoneGain.connect(this.ctx.destination);

    bellOsc.start(t);
    overtoneOsc.start(t);
    bellOsc.stop(t + 1.3);
    overtoneOsc.stop(t + 0.7);
  }

  public playPaperSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Filtered noise simulating paper sweeping out of platen and landing in diary
    this.playBurstNoise(0.5, 0.2, 900, 'bandpass');
  }

  public playBookOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Heavy leather book opening thump & subtle paper rustle
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);

    this.playBurstNoise(0.35, 0.15, 600, 'lowpass');
  }

  private playBurstNoise(duration: number, volume: number, filterFreq: number, filterType: BiquadFilterType = 'highpass') {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + duration);
  }

  public toggleAmbientSound(enable?: boolean): boolean {
    this.initContext();
    if (!this.ctx) return false;

    const shouldEnable = enable !== undefined ? enable : !this.isAmbientPlaying;
    
    if (shouldEnable) {
      if (this.ambientSource) {
        try { (this.ambientSource as AudioBufferSourceNode).stop(); } catch (_) {}
      }
      
      // Continuous soothing atmospheric library ambiance: filtered rain/soft crackle
      const bufferLength = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferLength, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferLength; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(380, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      whiteNoise.connect(lowpass);
      lowpass.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      whiteNoise.start();
      this.ambientSource = whiteNoise;
      this.isAmbientPlaying = true;
    } else {
      if (this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        if (this.ambientSource) {
          try { (this.ambientSource as AudioBufferSourceNode).stop(); } catch (_) {}
          this.ambientSource = null;
        }
      }, 350);
      this.isAmbientPlaying = false;
    }
    return this.isAmbientPlaying;
  }
}

export const audioEngine = new AtelierAudioEngine();
