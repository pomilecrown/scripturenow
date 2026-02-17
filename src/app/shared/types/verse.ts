export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Verse {
  id: string;
  reference: string;
  book: string;
  chapter: string;
  verse: string;
  difficulty: Difficulty;
}
