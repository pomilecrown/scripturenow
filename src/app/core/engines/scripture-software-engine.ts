import { Type } from '@angular/core';
import { Verse } from '../../shared/types/verse';

/** Form value for three-field input (Book, Chapter, Verse). */
export interface ScriptureFormValueThree {
  book: string;
  chapter: string;
  verse: string;
}

/** Form value for single-line input. */
export type ScriptureFormValueSingle = string;

export type ScriptureFormValue = ScriptureFormValueThree | ScriptureFormValueSingle;

export type InputType = 'threeFields' | 'singleLine';

export interface ScriptureSoftwareEngine {
  id: string;
  name: string;
  shortName: string;
  inputType: InputType;
  /** Normalize user input to a canonical string for comparison. */
  normalize(input: ScriptureFormValue): string;
  /** Return true if normalized user input matches the expected verse. */
  validate(normalized: string, expectedVerse: Verse): boolean;
}
