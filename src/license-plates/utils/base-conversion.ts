import { Letter } from './letters';

// guaranteed to be non-decimal to schema enforcement in input function
export const numericValueToBase26 = (numericValue: number) => {
  // we're converting to base 26, which is the number of letters
  const toBase = Letter.length;
  if (numericValue < toBase) {
    return Letter[numericValue];
  }

  let valueFromBase = numericValue;

  let result = '';

  while (valueFromBase > 0) {
    const remainder = valueFromBase % toBase;
    result = Letter[remainder] + result;
    valueFromBase = Math.floor(valueFromBase / toBase);
  }
  return result;
};
