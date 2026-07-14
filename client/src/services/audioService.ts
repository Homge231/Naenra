class AudioService {
  private correctAudio: HTMLAudioElement;
  private skipAudio: HTMLAudioElement;

  constructor() {
    this.correctAudio = new Audio('/audio/correct.mp3');
    this.skipAudio = new Audio('/audio/skip.mp3');
  }

  playCorrect() {
    // Clone node to allow rapid overlapping plays
    const audio = this.correctAudio.cloneNode() as HTMLAudioElement;
    audio.volume = 0.5; // Ensure it's not too loud
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }

  playSkip() {
    const audio = this.skipAudio.cloneNode() as HTMLAudioElement;
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }
}

export const audioService = new AudioService();
