import { log } from '../utils/log';
import { conccurentlyFetchUrls } from './fetch-urls';

const urls = [
  'https://google.com/',
  'https://google.com/',
  'https://google.com/',
  'https://google.com/',
  'https://google.com/',
];

void (async () => {
  try {
    const results = await conccurentlyFetchUrls(urls, 1);
    log('successfully fetched', { results }, true);
  } catch (err) {
    log('failed to fetch', { message: err.message }, true);
  } finally {
    process.exit(0);
  }
})();
