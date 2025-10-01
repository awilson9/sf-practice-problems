import { log } from '../utils/log';
import { getLicensePlateNumberInSequence } from './get-license-plate-in-sequence';

const checkOutput = (actual: string, { expected }: { expected: string }) => {
  if (actual !== expected) {
    log('❌ incorrect result', { expected, actual }, true);
    return;
  }
  log('✅ success', { actual, expected }, true);
};

// no letters
checkOutput(getLicensePlateNumberInSequence(999_999), { expected: '999999' });

// one letter
checkOutput(getLicensePlateNumberInSequence(1_000_000), { expected: '00000A' });
checkOutput(getLicensePlateNumberInSequence(1_099_999), { expected: '99999A' });
checkOutput(getLicensePlateNumberInSequence(1_100_000), { expected: '00000B' });
checkOutput(getLicensePlateNumberInSequence(1_199_999), { expected: '99999B' });
checkOutput(getLicensePlateNumberInSequence(1_200_000), { expected: '00000C' });
checkOutput(getLicensePlateNumberInSequence(1_300_000), { expected: '00000D' });
checkOutput(getLicensePlateNumberInSequence(1_400_000), { expected: '00000E' });
checkOutput(getLicensePlateNumberInSequence(1_500_000), { expected: '00000F' });
checkOutput(getLicensePlateNumberInSequence(1_600_000), { expected: '00000G' });
checkOutput(getLicensePlateNumberInSequence(1_700_000), { expected: '00000H' });
checkOutput(getLicensePlateNumberInSequence(1_800_000), { expected: '00000I' });
checkOutput(getLicensePlateNumberInSequence(1_900_000), { expected: '00000J' });
checkOutput(getLicensePlateNumberInSequence(2_000_000), { expected: '00000K' });
checkOutput(getLicensePlateNumberInSequence(2_100_000), { expected: '00000L' });
checkOutput(getLicensePlateNumberInSequence(2_200_000), { expected: '00000M' });
checkOutput(getLicensePlateNumberInSequence(2_300_000), { expected: '00000N' });
checkOutput(getLicensePlateNumberInSequence(2_400_000), { expected: '00000O' });
checkOutput(getLicensePlateNumberInSequence(2_500_000), { expected: '00000P' });
checkOutput(getLicensePlateNumberInSequence(2_500_000), { expected: '00000P' });
checkOutput(getLicensePlateNumberInSequence(2_600_000), { expected: '00000Q' });
checkOutput(getLicensePlateNumberInSequence(2_700_000), { expected: '00000R' });
checkOutput(getLicensePlateNumberInSequence(2_800_000), { expected: '00000S' });
checkOutput(getLicensePlateNumberInSequence(2_900_000), { expected: '00000T' });
checkOutput(getLicensePlateNumberInSequence(3_000_000), { expected: '00000U' });
checkOutput(getLicensePlateNumberInSequence(3_100_000), { expected: '00000V' });
checkOutput(getLicensePlateNumberInSequence(3_200_000), { expected: '00000W' });
checkOutput(getLicensePlateNumberInSequence(3_300_000), { expected: '00000X' });
checkOutput(getLicensePlateNumberInSequence(3_400_000), { expected: '00000Y' });
checkOutput(getLicensePlateNumberInSequence(3_500_000), { expected: '00000Z' });
checkOutput(getLicensePlateNumberInSequence(3_599_999), { expected: '99999Z' });

// 2 letters
checkOutput(getLicensePlateNumberInSequence(3_600_000), { expected: '0000AA' });
checkOutput(getLicensePlateNumberInSequence(3_610_000), { expected: '0000AB' });
checkOutput(getLicensePlateNumberInSequence(3_870_000), { expected: '0000BB' });
checkOutput(getLicensePlateNumberInSequence(10_350_000), { expected: '0000ZZ' });

// 3 letters
checkOutput(getLicensePlateNumberInSequence(10_360_000), { expected: '000AAA' });

checkOutput(getLicensePlateNumberInSequence(12_524_567), { expected: '567DFG' });

// all letters
checkOutput(getLicensePlateNumberInSequence(192_941_625), { expected: 'ABCDEF' });
checkOutput(getLicensePlateNumberInSequence(501_363_135), { expected: 'ZZZZZZ' });
