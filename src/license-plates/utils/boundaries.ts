import { log } from '../../utils/log';
import { Letter } from './letters';

export const boundaries = [
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

export type Boundary = (typeof boundaries)[number];

export const calculateFactorOfNumericValue = (numericPower: number) => Math.pow(10, numericPower);
export const calculateFactorOfAlphabeticValue = (letterPower: number) =>
  Math.pow(Letter.length, letterPower);

const calculateNumberOfEntriesAtBoundary = ({ numericPower, letterPower }: Boundary) =>
  calculateFactorOfNumericValue(numericPower) * calculateFactorOfAlphabeticValue(letterPower);

export const calculateEndpointOfBoundary = (boundaryIndex: number) =>
  boundaries
    .slice(0, boundaryIndex + 1)
    .reduce((p, boundary) => (p += calculateNumberOfEntriesAtBoundary(boundary)), 0);

export const MAXIMUM_INDEX = calculateEndpointOfBoundary(boundaries.length);

boundaries.forEach((_, i) => log('boundaries', calculateEndpointOfBoundary(i)));
