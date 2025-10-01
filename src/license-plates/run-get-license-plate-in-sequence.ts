import { log } from '../utils/log';
import { getLicensePlateNumberInSequence } from './get-license-plate-in-sequence';

const inputs = [0, 999, 100_000, 500_000, 10_000];

void (async () => {
  try {
    inputs.forEach((i) => {
      const result = getLicensePlateNumberInSequence(i);
      log(
        'fetched license plate number',
        {
          input: i,
          result,
        },
        true
      );
    });
  } catch (err) {
    log('failed to get license plate', { message: err.message }, true);
  } finally {
    process.exit(0);
  }
})();
