import { Verse } from './verse';
import { Difficulty } from './verse';

export interface SessionAnswerDetail {
  yourAnswer: string;
  correctAnswer: string;
  timeSeconds: number;
  correct: boolean;
}

export interface SessionResult {
  accuracy: number;
  averageTimeSeconds: number;
  scripturesAttempted: number;
  platform: string;
  difficulty: Difficulty;
  date: string; // ISO
  details: SessionAnswerDetail[];
}

export interface SessionState {
  active: boolean;
  verses: Verse[];
  currentIndex: number;
  verseStartTime: number | null; // Date.now() when verse started
  answers: SessionAnswerDetail[];
  voiceId: string;
  difficulty: Difficulty;
  skipOnWrong: boolean;
  platform: string;
}
