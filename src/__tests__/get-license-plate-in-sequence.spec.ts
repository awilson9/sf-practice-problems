import { describe, expect, test } from '@jest/globals';
import { getLicensePlateNumberInSequence } from '../license-plates/get-license-plate-in-sequence';

const testCases = [
  // no letters
  [999_999, '999999'],

  // one letter
  [1_000_000, '00000A'],
  [1_099_999, '99999A'],
  [1_100_000, '00000B'],
  [1_199_999, '99999B'],
  [1_200_000, '00000C'],
  [1_300_000, '00000D'],
  [1_400_000, '00000E'],
  [1_500_000, '00000F'],
  [1_600_000, '00000G'],
  [1_700_000, '00000H'],
  [1_800_000, '00000I'],
  [1_900_000, '00000J'],
  [2_000_000, '00000K'],
  [2_100_000, '00000L'],
  [2_200_000, '00000M'],
  [2_300_000, '00000N'],
  [2_400_000, '00000O'],
  [2_500_000, '00000P'],
  [2_500_000, '00000P'],
  [2_600_000, '00000Q'],
  [2_700_000, '00000R'],
  [2_800_000, '00000S'],
  [2_900_000, '00000T'],
  [3_000_000, '00000U'],
  [3_100_000, '00000V'],
  [3_200_000, '00000W'],
  [3_300_000, '00000X'],
  [3_400_000, '00000Y'],
  [3_500_000, '00000Z'],
  [3_599_999, '99999Z'],

  // 2 letters
  [3_600_000, '0000AA'],
  [3_610_000, '0000AB'],
  [3_870_000, '0000BB'],
  [10_350_000, '0000ZZ'],

  // 3 letters
  [10_360_000, '000AAA'],

  [12_524_567, '567DFG'],

  // all letters
  [192_941_625, 'ABCDEF'],
  [501_363_135, 'ZZZZZZ'],
] as const;

const errorCases = [-1, 501_363_136, 1.6] as const;

describe('Get License Plates in sequence', () => {
  test.each(testCases)(
    'should successfully convert %p to license plate number %p',
    (input, expected) => {
      const output = getLicensePlateNumberInSequence(input);
      expect(output).toEqual(expected);
    }
  );

  test.each(errorCases)('should fail to convert %p', (input) => {
    try {
      getLicensePlateNumberInSequence(input);
    } catch (err) {
      expect(true).toBe(true);
      return;
    }
    expect(true).toBe(false);
  });
});
