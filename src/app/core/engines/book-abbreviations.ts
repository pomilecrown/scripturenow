/** Common book abbreviations (lowercase) to canonical book name (lowercase) for validation. */
export const BOOK_ABBREVIATIONS: Record<string, string> = {
  gen: 'genesis',
  exo: 'exodus',
  ex: 'exodus',
  lev: 'leviticus',
  num: 'numbers',
  nu: 'numbers',
  deut: 'deuteronomy',
  dt: 'deuteronomy',
  josh: 'joshua',
  jdg: 'judges',
  ruth: 'ruth',
  ru: 'ruth',
  '1sam': '1 samuel',
  '1sa': '1 samuel',
  '2sam': '2 samuel',
  '2sa': '2 samuel',
  '1ki': '1 kings',
  '2ki': '2 kings',
  '1chr': '1 chronicles',
  '1ch': '1 chronicles',
  '2chr': '2 chronicles',
  '2ch': '2 chronicles',
  ezra: 'ezra',
  ezr: 'ezra',
  neh: 'nehemiah',
  est: 'esther',
  job: 'job',
  jb: 'job',
  psa: 'psalm',
  ps: 'psalm',
  prov: 'proverbs',
  pr: 'proverbs',
  eccl: 'ecclesiastes',
  ecc: 'ecclesiastes',
  song: 'song of solomon',
  son: 'song of solomon',
  sos: 'song of solomon',
  isa: 'isaiah',
  jer: 'jeremiah',
  lam: 'lamentations',
  eze: 'ezekiel',
  ezk: 'ezekiel',
  dan: 'daniel',
  hos: 'hosea',
  joel: 'joel',
  amos: 'amos',
  obad: 'obadiah',
  ob: 'obadiah',
  jonah: 'jonah',
  jon: 'jonah',
  mic: 'micah',
  nah: 'nahum',
  hab: 'habakkuk',
  zeph: 'zephaniah',
  hag: 'haggai',
  zec: 'zechariah',
  mal: 'malachi',
  mat: 'matthew',
  mt: 'matthew',
  mark: 'mark',
  mk: 'mark',
  luke: 'luke',
  lk: 'luke',
  john: 'john',
  jn: 'john',
  jhn: 'john',
  act: 'acts',
  ac: 'acts',
  rom: 'romans',
  rm: 'romans',
  '1co': '1 corinthians',
  '2co': '2 corinthians',
  gal: 'galatians',
  eph: 'ephesians',
  phi: 'philippians',
  phil: 'philippians',
  col: 'colossians',
  '1th': '1 thessalonians',
  '2th': '2 thessalonians',
  '1ti': '1 timothy',
  '2ti': '2 timothy',
  tit: 'titus',
  phm: 'philemon',
  heb: 'hebrews',
  jam: 'james',
  jas: 'james',
  '1pe': '1 peter',
  '2pe': '2 peter',
  '1jo': '1 john',
  '1jn': '1 john',
  '1john': '1 john',
  '2jo': '2 john',
  '2jn': '2 john',
  '2john': '2 john',
  '3jo': '3 john',
  '3jn': '3 john',
  '3john': '3 john',
  jude: 'jude',
  rev: 'revelation',
  rv: 'revelation'
};

export function expandAbbreviation(abbr: string): string {
  const key = abbr.toLowerCase().trim();
  return BOOK_ABBREVIATIONS[key] ?? key;
}

/** Parse "jn 3:16" or "1jn 2:1" into normalized "john 3:16" / "1 john 2:1". */
export function normalizeWithAbbreviations(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const match = s.match(/^(\d?\s*\w+(?:\s+\w+)?)\s+(\d+):(\d+)$/) || s.match(/^(\d?\s*\w+)\s+(\d+)\s+(\d+)$/);
  if (!match) return s;
  const bookPart = match[1].replace(/\s+/g, '').trim();
  const ch = match[2];
  const vs = match[3];
  const expanded = expandAbbreviation(bookPart);
  return `${expanded} ${ch}:${vs}`;
}
