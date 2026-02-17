import { Injectable, signal, computed } from '@angular/core';
import { VerseService } from './verse.service';
import { AudioService } from './audio.service';
import { SoftwareSelectionService } from './software-selection.service';
import { Verse, Difficulty } from '../shared/types/verse';
import { SessionResult, SessionState, SessionAnswerDetail } from '../shared/types/session';
import { ScriptureFormValue } from '../core/engines/scripture-software-engine';
import { getEngineById } from '../core/engines/engine-registry';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private state = signal<SessionState>({
    active: false,
    verses: [],
    currentIndex: 0,
    verseStartTime: null,
    answers: [],
    voiceId: '',
    difficulty: 'easy',
    skipOnWrong: false,
    platform: ''
  });

  sessionState = this.state.asReadonly();
  currentVerse = computed(() => {
    const s = this.state();
    const verses = s.verses;
    const idx = s.currentIndex;
    return verses[idx] ?? null;
  });
  elapsedSeconds = signal(0);
  /** Set when session ends; Results page reads this and then clears after saving. */
  lastResult = signal<SessionResult | null>(null);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private verseService: VerseService,
    private audioService: AudioService,
    private softwareSelection: SoftwareSelectionService
  ) {}

  startSession(voiceId: string, difficulty: Difficulty, count: number, skipOnWrong: boolean): void {
    const engine = this.softwareSelection.selectedEngine();
    if (!engine) return;

    this.verseService.getSessionVerses(difficulty, count).subscribe((verses) => {
      if (verses.length === 0) return;

      this.audioService.stop();
      this.state.set({
        active: true,
        verses,
        currentIndex: 0,
        verseStartTime: null,
        answers: [],
        voiceId,
        difficulty,
        skipOnWrong,
        platform: engine.name
      });
      this.elapsedSeconds.set(0);
      this.startTimer();
      this.playCurrentVerse();
    });
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const s = this.state();
      if (s.verseStartTime != null) {
        this.elapsedSeconds.set((Date.now() - s.verseStartTime) / 1000);
      }
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private playCurrentVerse(): void {
    const s = this.state();
    const verse = s.verses[s.currentIndex];
    if (!verse) return;

    this.state.update((prev) => ({ ...prev, verseStartTime: Date.now() }));
    this.elapsedSeconds.set(0);

    this.audioService.play(s.voiceId, verse.id).catch(() => {
      // Audio failed (e.g. file missing); continue session
    });
  }

  /** Returns: session ended (result), advanced to next verse, or retry (wrong, stay on verse). */
  submitAnswer(input: ScriptureFormValue): { kind: 'ended'; result: SessionResult } | { kind: 'advanced' } | { kind: 'retry' } {
    const s = this.state();
    const verse = s.verses[s.currentIndex];
    const engine = getEngineById(this.softwareSelection.selectedEngine()?.id ?? '');
    if (!verse || !engine || s.verseStartTime == null) return { kind: 'retry' };

    const normalized = engine.normalize(input);
    const correct = engine.validate(normalized, verse);
    const timeSeconds = (Date.now() - s.verseStartTime) / 1000;

    const displayAnswer = typeof input === 'string' ? input : [input.book, input.chapter, input.verse].filter(Boolean).join(' ');

    const detail: SessionAnswerDetail = {
      yourAnswer: displayAnswer || normalized,
      correctAnswer: verse.reference,
      timeSeconds,
      correct
    };

    const advance = correct || s.skipOnWrong;
    if (!advance) return { kind: 'retry' };

    const newAnswers = [...s.answers, detail];
    const nextIndex = s.currentIndex + 1;

    if (nextIndex >= s.verses.length) {
      this.stopTimer();
      this.audioService.stop();
      const result = this.buildResult(s.verses, newAnswers, s.platform, s.difficulty);
      this.lastResult.set(result);
      this.state.set({
        ...s,
        active: false,
        answers: newAnswers,
        currentIndex: nextIndex
      });
      return { kind: 'ended', result };
    }

    this.state.update((prev) => ({
      ...prev,
      answers: newAnswers,
      currentIndex: nextIndex,
      verseStartTime: null
    }));
    this.playCurrentVerse();
    return { kind: 'advanced' };
  }

  private buildResult(
    verses: Verse[],
    answers: SessionAnswerDetail[],
    platform: string,
    difficulty: Difficulty
  ): SessionResult {
    const correctCount = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const accuracy = total > 0 ? (correctCount / total) * 100 : 0;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSeconds, 0);
    const averageTimeSeconds = total > 0 ? totalTime / total : 0;

    return {
      accuracy,
      averageTimeSeconds,
      scripturesAttempted: total,
      platform,
      difficulty,
      date: new Date().toISOString(),
      details: answers
    };
  }

  endSession(): SessionResult | null {
    const s = this.state();
    if (!s.active) return null;
    this.stopTimer();
    this.audioService.stop();
    const result = this.buildResult(s.verses, s.answers, s.platform, s.difficulty);
    this.lastResult.set(result);
    this.state.set({ ...s, active: false });
    return result;
  }

  getLastResult(): SessionResult | null {
    const s = this.state();
    if (s.verses.length === 0 || s.answers.length === 0) return null;
    return this.buildResult(s.verses, s.answers, s.platform, s.difficulty);
  }
}
