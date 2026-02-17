import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;

  play(voiceId: string, verseId: string): Promise<void> {
    this.stop();
    const url = `assets/audio/${voiceId}/${verseId}.mp3`;
    this.currentAudio = new Audio(url);
    return new Promise((resolve, reject) => {
      if (!this.currentAudio) return reject(new Error('No audio'));
      this.currentAudio.onended = () => resolve();
      this.currentAudio.onerror = () => reject(new Error('Audio load/play failed'));
      this.currentAudio.play().catch(reject);
    });
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /** Resolve URL for a voice + verse (e.g. for preload or fallback message). */
  getAudioUrl(voiceId: string, verseId: string): string {
    return `assets/audio/${voiceId}/${verseId}.mp3`;
  }
}
