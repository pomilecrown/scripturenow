import { ScriptureSoftwareEngine, ScriptureFormValue, ScriptureFormValueThree } from './scripture-software-engine';
import { Verse } from '../../shared/types/verse';
import { normalizeWithAbbreviations } from './book-abbreviations';

function normalizeRef(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export const ProPresenterEngine: ScriptureSoftwareEngine = {
  id: 'propresenter',
  name: 'ProPresenter',
  shortName: 'ProPresenter',
  inputType: 'singleLine',

  normalize(input: ScriptureFormValue): string {
    if (typeof input === 'string') return normalizeWithAbbreviations(input);
    const three = input as ScriptureFormValueThree;
    const combined = [three.book, three.chapter, three.verse].filter(Boolean).join(' ');
    return normalizeWithAbbreviations(combined.replace(/(\d+)\s+(\d+)$/, '$1:$2'));
  },

  validate(normalized: string, expectedVerse: Verse): boolean {
    const expected = normalizeRef(expectedVerse.reference);
    return normalized === expected;
  }
};
