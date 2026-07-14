import { ref } from 'vue'

class AudioService {
  private correctAudio: HTMLAudioElement;
  private skipAudio: HTMLAudioElement;
  public isEnabled = ref(true);

  constructor() {
    this.correctAudio = new Audio('/audio/correct.mp3');
    this.skipAudio = new Audio('/audio/skip.mp3');
    
    const stored = localStorage.getItem('arena_sound');
    if (stored !== null) {
      this.isEnabled.value = stored === 'true';
    }
  }

  toggleSound() {
    this.isEnabled.value = !this.isEnabled.value;
    localStorage.setItem('arena_sound', String(this.isEnabled.value));
  }

  playCorrect() {
    if (!this.isEnabled.value) return;
    // Clone node to allow rapid overlapping plays
    const audio = this.correctAudio.cloneNode() as HTMLAudioElement;
    audio.volume = 0.5; // Ensure it's not too loud
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }

  playSkip() {
    if (!this.isEnabled.value) return;
    const audio = this.skipAudio.cloneNode() as HTMLAudioElement;
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }
}

export const audioService = new AudioService();
