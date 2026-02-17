import { ScriptureSoftwareEngine, ScriptureFormValue, ScriptureFormValueThree } from './scripture-software-engine';
import { Verse } from '../../shared/types/verse';

function normalizeRef(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export const SongShowPlusEngine: ScriptureSoftwareEngine = {
  id: 'songshowplus',
  name: 'Song Show Plus',
  shortName: 'SSP',
  inputType: 'singleLine',

  normalize(input: ScriptureFormValue): string {
    if (typeof input === 'string') return normalizeRef(input);
    const three = input as ScriptureFormValueThree;
    const book = (three.book ?? '').trim();
    const ch = (three.chapter ?? '').trim();
    const vs = (three.verse ?? '').trim();
    const combined = vs ? `${book} ${ch}:${vs}` : `${book} ${ch}`;
    return normalizeRef(combined);
  },

  validate(normalized: string, expectedVerse: Verse): boolean {
    const expected = normalizeRef(expectedVerse.reference);
    return normalized === expected;
  }
};
