import { getCoreFamily } from '../game/cores/families';

const FAMILY_SFX_MAP: Record<string, string> = {
  'phoenix': '/audio/cores/phoenix_activate.wav',
  'speedster': '/audio/cores/speedster_activate.wav',
  'combo': '/audio/cores/combo_activate.wav',
  'balanced': '/audio/cores/balance_activate.wav',
  'oracle': '/audio/cores/oracle_activate.wav',
  'aegis': '/audio/cores/aegis_activate.wav',
  'mission': '/audio/cores/mission_activate.wav',
  'power': '/audio/cores/power_activate.wav',
  'pandora': '/audio/cores/pandora_activate.wav',
  'highroller': '/audio/cores/highroller_activate.wav'
};

const FAMILY_BGM_MAP: Record<string, string> = {
  'combo': '/audio/combo.mp3',
  'speedster': '/audio/speedster.mp3',
  'oracle': '/audio/Oracle.mp3',
  'mission': '/audio/mission imposiblle.mp3',
  'aegis': '/audio/aegile shield.mp3',
  'balanced': '/audio/balance.mp3',
  'power': '/audio/power strike.mp3',
  'pandora': '/audio/pandora.mp3',
  'phoenix': '/audio/phoenix.mp3',
  'highroller': '/audio/high roller.mp3'
};

class AudioService {
  private correctAudio: HTMLAudioElement | null = null;
  private skipAudio: HTMLAudioElement | null = null;
  private audioCache: Record<string, HTMLAudioElement> = {};
  
  // BGM State
  private bgmAudio: HTMLAudioElement | null = null;
  private currentBgmPath: string = '';

  constructor() {
    // Lazy load audio assets on demand
  }

  private getVolume(): number {
    const stored = localStorage.getItem('arena_volume');
    if (stored !== null && stored.trim() !== '') {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        return parsed / 100.0;
      }
    }
    return 0.5; // Default 50%
  }

  private getOrCreateAudio(path: string): HTMLAudioElement {
    if (!this.audioCache[path]) {
      const audio = new Audio(path);
      this.audioCache[path] = audio;
    }
    return this.audioCache[path];
  }

  private playSound(path: string) {
    const vol = this.getVolume();
    if (vol <= 0 || !path) return;
    try {
      const audio = this.getOrCreateAudio(path);
      audio.volume = vol;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently ignore missing files or browser autoplay blocks
      });
    } catch {
      // Ignore audio load issues
    }
  }

  playCorrect() {
    this.playSound('/audio/correct.mp3');
  }

  playSkip() {
    this.playSound('/audio/wrong.mp3');
  }

  playError() {
    this.playSound('/audio/wrong.mp3');
  }

  playHover() {
    // Only play if UI sound file exists in public assets
    // this.playSound('/audio/ui/hover.wav');
  }

  playClick() {
    // Only play if UI sound file exists in public assets
    // this.playSound('/audio/ui/click.wav');
  }

  playReroll() {
    // Only play if UI sound file exists in public assets
    // this.playSound('/audio/ui/reroll.wav');
  }

  playCoreActivation(coreName: string) {
    if (!coreName) return;
    const family = getCoreFamily(coreName);
    if (!family) return;
    
    const path = FAMILY_SFX_MAP[family];
    if (path) {
      this.playSound(path);
    }
  }

  // ── Background Music (BGM) ────────────────────────────────────────────────
  
  playBGM(path: string) {
    if (!path) {
      this.stopBGM();
      this.currentBgmPath = '';
      return;
    }

    if (this.currentBgmPath === path && this.bgmAudio) {
      // Already playing this track
      return;
    }

    this.stopBGM();

    this.currentBgmPath = path;
    this.bgmAudio = new Audio(path);
    this.bgmAudio.preload = 'auto';
    this.bgmAudio.loop = true;
    
    const vol = this.getVolume();
    // Usually BGM should be slightly quieter than SFX
    this.bgmAudio.volume = Math.max(0, vol * 0.35); 
    
    this.bgmAudio.play().catch(e => console.warn('BGM play failed:', e));
  }

  setMasterVolume(vol: number) {
    if (this.bgmAudio) {
      this.bgmAudio.volume = Math.max(0, vol * 0.35);
    }
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
    this.currentBgmPath = '';
  }

  getCoreBgmPath(coreName: string | null | undefined): string {
    if (!coreName) return '';
    
    const family = getCoreFamily(coreName);
    if (family && FAMILY_BGM_MAP[family]) {
      return FAMILY_BGM_MAP[family];
    }
    
    return '';
  }
}

export const audioService = new AudioService();
