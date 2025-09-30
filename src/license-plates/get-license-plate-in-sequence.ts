/**
 * You work for the DMV; you have a specific, sequential way of generating new license plate numbers:
 *
 * Each license plate number has 6 alphanumeric characters. The numbers always come before the letters.
 *
 * The first plate number is 000000, followed by 000001...
 * When you arrive at 999999, the next entry would be 00000A, Followed by 00001A...
 * When you arrive at 99999A, the next entry is 00000B, Followed by 00001B...
 * After following the pattern to 99999Z, the next in the sequence would be 0000AA...
 *
 * When 9999AA is reached, the next in the series would be 0000AB...0001AB
 * When 9999AB is reached, the next in the series would be 0000AC...0001AC
 * When 9999AZ is reached, the next in the series would be 0000BA...0001BA
 * When 9999ZZ is reached, the next in the series would be 000AAA...001AAA
 *
 * And so on untill the sequence completes with ZZZZZZ.
 *
 * So the pattern overview looks a bit like this:
 *
 * 000000
 * 000001
 * ...
 * 999999
 * 00000A
 * 00001A
 * ...
 * 99999A
 * 00000B
 * 00001B
 * ...
 * 99999Z
 * 0000AA
 * 0001AA
 * ...
 * 9999AA
 * 0000AB
 * 0001AB
 * ...
 * 9999AB
 * 0000AC
 * 0001AC
 * ...
 * 9999AZ
 * 0000BA
 * 0001BA
 * ...
 * 9999BZ
 * 0000CA
 * 0001CA
 * ...
 * 9999ZZ
 * 000AAA
 * 001AAA
 * ...
 * 999AAA
 * 000AAB
 * 001AAB
 * ...
 * 999AAZ
 * 000ABA
 * ...
 * ZZZZZZ
 *
 *
 * The goal is to write the most efficient function that can return the nth element in this sequence.
 * */

import { length, number, z } from 'zod';

const boundaries = [
  {
    numericPower: 6,
    letterPower: 0,
  },
  {
    numericPower: 5,
    letterPower: 1,
  },
  {
    numericPower: 4,
    letterPower: 2,
  },
  {
    numericPower: 3,
    letterPower: 3,
  },
  {
    numericPower: 2,
    letterPower: 4,
  },
  {
    numericPower: 1,
    letterPower: 5,
  },
  {
    numericPower: 0,
    letterPower: 6,
  },
] as const;

// could compute this very simply for arbitrary length output, keeping it explicit to help me visualize the problem

type Boundary = (typeof boundaries)[number];

const arrayOfSize = (size: number, fillWith?: string) => {
  try {
    return Array(size).fill(fillWith ?? null);
  } catch (err) {
    throw new Error(`invalid array range ${size}`, { cause: err });
  }
};

const log = (message: string, meta: any) => {
  console.log(message, JSON.stringify(meta, null, 2));
};

const calculateFactorOfNumericValue = (numericPower: number) => Math.pow(10, numericPower);
const calculateFactorOfAlphabeticValue = (letterPower: number) => Math.pow(26, letterPower);

const calculateNumberOfEntriesAtBoundary = ({ numericPower, letterPower }: Boundary) =>
  calculateFactorOfNumericValue(numericPower) * calculateFactorOfAlphabeticValue(letterPower);

const calculateEndpointOfBoundary = (boundaryIndex: number) =>
  boundaries
    .slice(0, boundaryIndex + 1)
    .reduce((p, boundary) => (p += calculateNumberOfEntriesAtBoundary(boundary)), 0);

const indexToLetter = (i: number): string => {
  if (i < 0 || i > 25) throw new RangeError(`Index must be 0–25, got: ${i}`);
  return String.fromCharCode(65 + i); // 65 = 'A'
};

const MAXIMUM_INDEX = calculateEndpointOfBoundary(boundaries.length);
console.log(MAXIMUM_INDEX);

const validInputSchema = z.number().min(0).max(MAXIMUM_INDEX);

const generateAlphabeticPortion = ({
  indexOffset,
  numberOfLetters,
  modFactor,
}: {
  indexOffset: number;
  numberOfLetters: number;
  modFactor: number;
}) => {
  // TODO: we don't actually need to store these in memory it can be done in place
  const rangesForEachLetterValue = arrayOfSize(numberOfLetters).map((_, letterIndex) => {
    return arrayOfSize(26).map((_, i) => {
      const modFactorForNumericIndex = calculateFactorOfNumericValue(letterIndex) * modFactor;
      const modFactorForLetterIndex = calculateFactorOfAlphabeticValue(letterIndex);
      return (i + 1) * modFactorForNumericIndex * modFactorForLetterIndex;
    });
  });

  log('ranges for letter value', rangesForEachLetterValue);

  const lettersFromRanges = arrayOfSize(numberOfLetters)
    .map((_, i) => {
      const rangesForIndex = rangesForEachLetterValue[i];
      const moddedIndexOffset = indexOffset % calculateFactorOfAlphabeticValue(i);
      const indexOfLetterInRangeForCharacter = rangesForIndex.findIndex(
        (rangeValue) => moddedIndexOffset < rangeValue
      );
      console.log('from ranges info?', {
        indexOffset,
        indexOfLetterInRangeForCharacter,
      });
      return indexToLetter(indexOfLetterInRangeForCharacter);
    })
    .reverse()
    .join('');

  return lettersFromRanges;
};

const numberToStringWithLeadingZeroes = (value: number, lengthOfOutput: number) => {
  const numberOfDigits = value.toString().length;

  const leadingZeroes = arrayOfSize(lengthOfOutput - numberOfDigits, '0');
  return leadingZeroes.join('') + value.toString();
};

export const getLicensePlateNumberInSequence = (index: number) => {
  const validIndexParseResult = validInputSchema.safeParse(index);
  if (!validIndexParseResult.success) {
    throw validIndexParseResult.error;
  }
  const { data: validIndex } = validIndexParseResult;

  const boundaryIndex = boundaries.findIndex((_, i) => validIndex < calculateEndpointOfBoundary(i));
  // log('boundaryindex', { boundaryIndex });
  if (boundaryIndex === 0) {
    return index.toString();
  }

  const maxOfPrevBoundary = calculateEndpointOfBoundary(boundaryIndex - 1);
  const boundary = boundaries[boundaryIndex];
  const maxOfBoundary = calculateEndpointOfBoundary(boundaryIndex);

  const indexOffset = index - calculateEndpointOfBoundary(boundaryIndex - 1);
  const numberOfOptionsInBoundary = maxOfBoundary - maxOfPrevBoundary;

  // this should be 100,000
  const modFactor =
    numberOfOptionsInBoundary / calculateFactorOfAlphabeticValue(boundary.letterPower);

  log('boundary info', {
    indexOffset,
    boundary,
    maxOfBoundary,
    maxOfPrevBoundary,
    modFactor,
    numberOfOptionsInBoundary,
  });

  const letterValue = generateAlphabeticPortion({
    indexOffset,
    numberOfLetters: boundary.letterPower,
    modFactor,
  });

  const numericValue = indexOffset % modFactor;
  const numericValueWithLeadingZeros = numberToStringWithLeadingZeroes(
    numericValue,
    boundary.numericPower
  );

  return `${numericValueWithLeadingZeros}${letterValue}`;
};

// log(getLicensePlateNumberInSequence(999_999), { expected: '999999' });

const checkOutput = (actual: string, { expected }: { expected: string }) => {
  if (actual !== expected) {
    log('❌ incorrect result', { expected, actual });
    return;
  }
  log('✅ success', { actual, expected });
};

// checkOutput(getLicensePlateNumberInSequence(999_999), { expected: '999999' });
// checkOutput(getLicensePlateNumberInSequence(1_000_000), { expected: '00000A' });
// checkOutput(getLicensePlateNumberInSequence(1_099_999), { expected: '99999A' });

// checkOutput(getLicensePlateNumberInSequence(1_100_000), { expected: '00000B' });
// checkOutput(getLicensePlateNumberInSequence(1_199_999), { expected: '99999B' });
// checkOutput(getLicensePlateNumberInSequence(1_200_000), { expected: '00000C' });
// checkOutput(getLicensePlateNumberInSequence(1_300_000), { expected: '00000D' });
// checkOutput(getLicensePlateNumberInSequence(1_400_000), { expected: '00000E' });
// checkOutput(getLicensePlateNumberInSequence(1_500_000), { expected: '00000F' });
// checkOutput(getLicensePlateNumberInSequence(1_600_000), { expected: '00000G' });
// checkOutput(getLicensePlateNumberInSequence(1_700_000), { expected: '00000H' });
// checkOutput(getLicensePlateNumberInSequence(1_800_000), { expected: '00000I' });
// checkOutput(getLicensePlateNumberInSequence(1_900_000), { expected: '00000J' });
// checkOutput(getLicensePlateNumberInSequence(2_000_000), { expected: '00000K' });
// checkOutput(getLicensePlateNumberInSequence(2_100_000), { expected: '00000L' });
// checkOutput(getLicensePlateNumberInSequence(2_200_000), { expected: '00000M' });
// checkOutput(getLicensePlateNumberInSequence(2_300_000), { expected: '00000N' });
// checkOutput(getLicensePlateNumberInSequence(2_400_000), { expected: '00000O' });
// checkOutput(getLicensePlateNumberInSequence(2_500_000), { expected: '00000P' });
// checkOutput(getLicensePlateNumberInSequence(2_500_000), { expected: '00000P' });
// checkOutput(getLicensePlateNumberInSequence(2_600_000), { expected: '00000Q' });
// checkOutput(getLicensePlateNumberInSequence(2_700_000), { expected: '00000R' });
// checkOutput(getLicensePlateNumberInSequence(2_800_000), { expected: '00000S' });
// checkOutput(getLicensePlateNumberInSequence(2_900_000), { expected: '00000T' });
// checkOutput(getLicensePlateNumberInSequence(3_000_000), { expected: '00000U' });
// checkOutput(getLicensePlateNumberInSequence(3_100_000), { expected: '00000V' });
// checkOutput(getLicensePlateNumberInSequence(3_200_000), { expected: '00000W' });
// checkOutput(getLicensePlateNumberInSequence(3_300_000), { expected: '00000X' });
// checkOutput(getLicensePlateNumberInSequence(3_400_000), { expected: '00000Y' });
// checkOutput(getLicensePlateNumberInSequence(3_500_000), { expected: '00000Z' });
// checkOutput(getLicensePlateNumberInSequence(3_599_999), { expected: '99999Z' });

// last letter is every 10_000
// second to last letter is every 260,000
// checkOutput(getLicensePlateNumberInSequence(3_600_000), { expected: '0000AA' });
// checkOutput(getLicensePlateNumberInSequence(3_609_999), { expected: '9999AA' });
// checkOutput(getLicensePlateNumberInSequence(3_610_000), { expected: '0000AB' });
// checkOutput(getLicensePlateNumberInSequence(3_810_001), { expected: '0000AB' });
// checkOutput(getLicensePlateNumberInSequence(100_810_001), { expected: '0000AB' });
// TODO: does not work when everything is a letter :(
checkOutput(getLicensePlateNumberInSequence(501363135), { expected: 'ZZZZZZ' });
