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

/**
 * Total space
 * 10^6
 * 10^5 * (26)
 * 10^4 * (26 ^ 2)
 * 10^3 * (26 ^ 3)
 * 10^2 * (26 ^ 4)
 * 10^1 * (26 ^ 5)
 * 10^0 * 26 ^ 5
 */

// 999_999
// 99_999 * (26)
// 9_999 * (26 ^ 2)
// 999 * (26 ^ 3)
// 99 * (26 ^ 4)
// 9 * (26 ^ 5)
// 26 ^ 6

// 26
// AA
// AB
// AC
// AD
// ...
// AZ

// 26
// AB

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

type Boundary = (typeof boundaries)[number];

const calculateFactorOfNumericValue = (numericPower: number) => Math.pow(10, numericPower);
const calculateFactorOfAlphabeticValue = (letterPower: number) => Math.pow(26, letterPower);

const calculateMaxAmountAtBoundary = ({ numericPower, letterPower }: Boundary) =>
  calculateFactorOfNumericValue(numericPower) * calculateFactorOfAlphabeticValue(letterPower);

const MAXIMUM_INDEX = boundaries.reduce(
  (p, boundary) => (p += calculateMaxAmountAtBoundary(boundary)),
  0
);

const validInputSchema = z.number().min(0).max(MAXIMUM_INDEX);

const log = (message: string, meta: any) => {
  console.log(message, JSON.stringify(meta, null, 2));
};

const indexToLetter = (i: number): string => {
  if (i < 0 || i > 25) throw new RangeError('Index must be 0–25');
  return String.fromCharCode(65 + i); // 65 = 'A'
};

const numberToStringWithLeadingZeroes = (value: number, lengthOfOutput: number) => {
  const numberOfDigits = value.toString().length;
  console.log('number to string info', {
    value,
    lengthOfOutput,
    numberOfDigits,
  });
  const leadingZeroes = Array(lengthOfOutput - numberOfDigits).fill('0');
  return leadingZeroes.join('') + value.toString();
};

const generateAlphabeticPortion = ({
  maxOfBoundary,
  letterPower,
  indexOffset,
}: {
  maxOfBoundary: number;
  letterPower: number;
  indexOffset: number;
}) => {
  const modFactor = maxOfBoundary / calculateFactorOfAlphabeticValue(letterPower);
  const letterOffset = Math.floor(indexOffset / modFactor);

  const letterValue = indexToLetter(letterOffset);
};

export const getLicensePlateNumberInSequence = (index: number) => {
  const validIndexParseResult = validInputSchema.safeParse(index);
  if (!validIndexParseResult.success) {
    throw validIndexParseResult.error;
  }
  const { data: validIndex } = validIndexParseResult;

  const boundaryIndex = boundaries.findIndex(
    (boundary) => validIndex < calculateMaxAmountAtBoundary(boundary)
  );

  if (boundaryIndex === 0) {
    return index.toString();
  }

  const prevBoundary = boundaries[boundaryIndex - 1];
  const maxOfPrevBoundary = calculateMaxAmountAtBoundary(prevBoundary);
  const boundary = boundaries[boundaryIndex];
  const maxOfBoundary = calculateMaxAmountAtBoundary(boundary);
  const indexOffset = index - calculateMaxAmountAtBoundary(prevBoundary);
  const numberOfOptionsInBoundary = maxOfBoundary - maxOfPrevBoundary;

  const modFactor = maxOfBoundary / calculateFactorOfAlphabeticValue(boundary.letterPower);
  const letterOffset = Math.floor(indexOffset / modFactor);

  const letterValue = indexToLetter(letterOffset);
  const numericValueOffset = modFactor * letterOffset;
  const numericValue = indexOffset - numericValueOffset;

  log('boundary info', {
    prevBoundary,
    indexOffset,
    boundary,
    maxOfBoundary,
    modFactor,
    letterOffset,
    letterValue,
    numberOfOptionsInBoundary,
    numericValueOffset,
    numericValue,
  });

  return `${numberToStringWithLeadingZeroes(numericValue, boundary.numericPower)}${letterValue}`;
};

// the values between 1_000_000 -> 2_600_000 have one letter
// are 1_600_000 values with one letter
// how many have letter A? 100,000 of them
// 00_000A -> 99_999A
//

// console.log(getLicensePlateNumberInSequence(999_999));
console.log(getLicensePlateNumberInSequence(2_600_000));
// 1_600_000
