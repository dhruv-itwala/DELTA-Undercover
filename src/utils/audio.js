// Audio helper that uses public royalty-free sound effects
// with instantaneous Web Audio API synth fallbacks for reliable playback everywhere.

class SoundManager {
  constructor() {
    this.muted = false;
    this.audioContext = null;
    this.audioCache = {};

    // Publicly accessible sound effects (royalty-free CDN / public domains)
    this.soundUrls = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // crisp tap
      reveal: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // whoosh/reveal
      imposterBusted: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // dramatic alarm / success
      innocentLost: 'https://assets.mixkit.co/active_storage/sfx/253/253-preview.mp3', // sad buzzer / fail
      imposterWins: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', // evil laughter / dramatic hit
      civiliansWin: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // victory fanfare
      tick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // clock tick
      start: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' // gong/start game
    };
  }

  getAudioContext() {
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Synthesized Web Audio fallbacks
  playSynth(type) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'reveal') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'imposterBusted' || type === 'civiliansWin') {
        // High triumphant chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.08);
          g.gain.setValueAtTime(0.2, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.08);
          o.stop(now + 0.65);
        });
      } else if (type === 'innocentLost') {
        // Descending sad tones
        [440, 370, 311].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, now + i * 0.12);
          g.gain.setValueAtTime(0.18, now + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.15);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.12);
          o.stop(now + (i + 1) * 0.15);
        });
      } else if (type === 'imposterWins') {
        // Dark dramatic minor hit
        [220, 261.63, 311.13].forEach((freq) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.25, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now);
          o.stop(now + 0.8);
        });
      } else if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Ignored if audio isn't initialized yet
    }
  }

  play(name) {
    if (this.muted) return;

    // First try the public URL audio
    const url = this.soundUrls[name];
    if (url) {
      if (!this.audioCache[name]) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.audioCache[name] = audio;
      }
      const sound = this.audioCache[name];
      sound.currentTime = 0;
      sound.play().catch(() => {
        // If external audio fetch/autoplay fails or is blocked, seamlessly use Web Audio synth
        this.playSynth(name);
      });
    } else {
      this.playSynth(name);
    }
  }
}

export const sound = new SoundManager();

