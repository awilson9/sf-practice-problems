import { log } from '../../utils/log';
import { arrayOfSize } from '../../utils/arrays';

export const numberToStringWithLeadingZeroes = (value: number, lengthOfOutput: number) => {
  const numberOfDigits = value.toString().length;
  const leadingZeroes = arrayOfSize(lengthOfOutput - numberOfDigits, '0');
  return leadingZeroes.join('') + value.toString();
};

// when moving above 1 letter in the output, "0" no longer represents A, but instead AA, etc.
// padding just with A is sufficient, as once we get to the BB... BBB... value etc., the base26Value will actually match the numeric value
export const paddedLetterValueByNumberOfLetters = ({
  base26Value,
  numberOfLetters,
  indexOffset,
}: {
  base26Value: string;
  numberOfLetters: number;
  indexOffset: number;
}) => {
  // base case
  if (numberOfLetters <= 1) {
    return base26Value;
  }
  log('padding metadata', {
    numberOfLetters,
    indexOffset,
    base26ValueLength: base26Value.length,
    base26Value,
    what: numberOfLetters - base26Value.length,
  });

  if (base26Value.length < numberOfLetters) {
    let paddedValue = '';
    arrayOfSize(numberOfLetters - base26Value.length).forEach((_, i) => {
      paddedValue = paddedValue + 'A';
    });
    const result = paddedValue + base26Value;
    return result;
  }

  return base26Value;
};
