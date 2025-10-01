import { arrayOfSize } from '../../utils/arrays';

export const Letter = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;
export type Letter = (typeof Letter)[number];

export const Base10ToBase26LetterMap = Object.fromEntries(
  arrayOfSize(26)
    .fill(null)
    .map((_, i) => [i, Letter[i]])
);
