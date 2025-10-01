import { log } from '../utils/log';
import { z } from 'zod';

// Given an array of URLs and a MAX_CONCURRENCY integer, implement a
// function that will asynchronously fetch each URL, not requesting
// more than MAX_CONCURRENCY URLs at the same time. The URLs should be
// fetched as soon as possible. The function should return an array of
// responses for each URL.

// How would you write a test for such a function?

async function concurrentMap<U, T>(
  inputs: T[],
  func: (arg0: T, index: number, array: T[]) => U | PromiseLike<U>,
  MAX_CONCURRENCY = 10
): Promise<U[]> {
  let index = 0;
  const results: U[] = [];

  // Run a pseudo-thread that awaits result of callback `func`, applies to results then moves to the next available index iteratively
  const execThread = async (threadNumber: number) => {
    while (index < inputs.length) {
      const currIndex = index++;
      const input = inputs[currIndex];

      log('starting async operation in thread', {
        threadNumber,
        currIndex,
        input,
      });

      // Use of `currIndex` is important because `index` may change after await is resolved
      results[currIndex] = await func(input, currIndex, inputs);
      log('completed async operation in thread', {
        threadNumber,
        currIndex,
        input,
      });
    }
  };

  // Start threads
  const threads = [];
  log('starting thread execution', {
    inputs,
    concurrency: MAX_CONCURRENCY,
  });

  for (let thread = 0; thread < MAX_CONCURRENCY; thread++) {
    threads.push(execThread(thread));
  }
  await Promise.all(threads);
  log('completed thread execution', {
    inputs,
    concurrency: MAX_CONCURRENCY,
  });

  return results;
}

// branded types ensure we're always passing the result of the schema parse,
// otherwise you can mistakingly pass some arbitrary string
const ZodUrl = z.url().brand('URL');
type URL = z.infer<typeof ZodUrl>;

const validUrlsSchema = z.array(ZodUrl);

const safeFetchWithTimeout = async <T = unknown>(url: URL, timeoutMs = 15_000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const rawResponseData = await (async () => {
      try {
        return await response.text();
      } catch (err) {
        return err.message;
      }
    })();

    const responseAsJsonOrString = (() => {
      try {
        return JSON.parse(rawResponseData);
      } catch {
        return rawResponseData;
      }
    })();

    if (!response.ok) {
      const result = {
        result: 'error',
        status: response.status,
        data: responseAsJsonOrString,
      } as const;
      log(
        'Failed to fetch',
        {
          url,
          result,
        },
        true
      );
      return result;
    }

    const successResult = {
      result: 'success',
      status: response.status,
      data: responseAsJsonOrString as T,
    } as const;
    log('Successfully fetched result', successResult);
    return successResult;
  } finally {
    clearTimeout(timeout);
  }
};

export const conccurentlyFetchUrls = async (urls: string[], MAX_CONCURRENCY?: number) => {
  const parsedUrlsResult = validUrlsSchema.safeParse(urls);

  if (!parsedUrlsResult.success) {
    throw parsedUrlsResult.error;
  }

  const { data: validUrls } = parsedUrlsResult;

  const fetchResults = await concurrentMap(validUrls, safeFetchWithTimeout, MAX_CONCURRENCY);

  return fetchResults;
};
