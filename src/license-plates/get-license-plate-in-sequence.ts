import { z } from 'zod';
import {
  boundaries,
  calculateEndpointOfBoundary,
  calculateFactorOfAlphabeticValue,
  MAXIMUM_INDEX,
} from './utils/boundaries';
import { log } from '../utils/log';
import {
  numberToStringWithLeadingZeroes,
  paddedLetterValueByNumberOfLetters,
} from './utils/formatting';
import { numericValueToBase26 } from './utils/base-conversion';

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

const validInputSchema = z
  .number()
  .min(0)
  .max(MAXIMUM_INDEX - 1)
  .refine((n) => Number.isInteger(n));

/**
 * Fundamentally, calculating the letter portions of the sequence is a conversion from base 10 (number of digits)
 * to base 26 (number of letters)
 *
 * After the conversion, we decide how much of the result stays in base 10, and how much of the result stays in base 26
 * which is done by subtracting the given index from the number of possible options with the number of digits
 * corresponding to the index which is calculated in `boundaries`
 */
export const getLicensePlateNumberInSequence = (index: number) => {
  try {
    const validIndexParseResult = validInputSchema.safeParse(index);
    if (!validIndexParseResult.success) {
      throw validIndexParseResult.error;
    }
    const { data: validIndex } = validIndexParseResult;

    const boundaryIndex = boundaries.findIndex(
      (_, i) => validIndex < calculateEndpointOfBoundary(i)
    );

    const maxOfPrevBoundary = calculateEndpointOfBoundary(boundaryIndex - 1);
    const boundary = boundaries[boundaryIndex];
    const maxOfBoundary = calculateEndpointOfBoundary(boundaryIndex);

    const indexOffset = index - calculateEndpointOfBoundary(boundaryIndex - 1);
    const numberOfOptionsInBoundary = maxOfBoundary - maxOfPrevBoundary;

    // this should be 100_000, 10_000, 1_000, 100, 10, 1 per boundary
    const modFactor =
      numberOfOptionsInBoundary / calculateFactorOfAlphabeticValue(boundary.letterPower);

    const numericValue = indexOffset % modFactor;
    const numericValueWithLeadingZeros =
      boundary.numericPower === 0
        ? ''
        : numberToStringWithLeadingZeroes(numericValue, boundary.numericPower);

    if (boundary.letterPower === 0) {
      return numericValueWithLeadingZeros;
    }

    // represents the number of times the digits in the numericValue have cycled
    const letterPortionOfIndex = Math.floor(indexOffset / modFactor);

    const rawLetterValue = numericValueToBase26(letterPortionOfIndex);
    const paddedLetterValue = paddedLetterValueByNumberOfLetters({
      numberOfLetters: boundary.letterPower,
      indexOffset,
      base26Value: rawLetterValue,
    });

    log('letter value', {
      letterValue: paddedLetterValue,
      modFactor,
      indexOffset,
      letterPower: boundary.letterPower,
      numericPower: boundary.numericPower,
    });

    // don't need to compute numeric portion when everything is a letter.
    if (boundary.numericPower === 0) {
      return paddedLetterValue;
    }

    return `${numericValueWithLeadingZeros}${paddedLetterValue}`;
  } catch (err) {
    log(
      'failed to convert to license plate',
      {
        index,
        errorDetails: err.message,
      },
      true
    );
    throw err;
  }
};
