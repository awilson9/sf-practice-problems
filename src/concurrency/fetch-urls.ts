import { z } from 'zod';

async function concurrentMap<U, T>(
  inputs: T[],
  func: (arg0: T, index: number, array: T[]) => U | PromiseLike<U>,
  MAX_CONCURRENCY = 10
): Promise<U[]> {
  let index = 0;
  const results: U[] = [];

  // Run a pseudo-thread that awaits result of callback `func`, applies to results then moves to the next available index
  const execThread = async () => {
    while (index < inputs.length) {
      const curIndex = index++;
      // Use of `curIndex` is important because `index` may change after await is resolved
      results[curIndex] = await func(inputs[curIndex], curIndex, inputs);
    }
  };

  // Start threads
  const threads = [];
  for (let thread = 0; thread < MAX_CONCURRENCY; thread++) {
    threads.push(execThread());
  }
  await Promise.all(threads);
  return results;
}

// Given an array of URLs and a MAX_CONCURRENCY integer, implement a
// function that will asynchronously fetch each URL, not requesting
// more than MAX_CONCURRENCY URLs at the same time. The URLs should be
// fetched as soon as possible. The function should return an array of
// responses for each URL.

// How would you write a test for such a function?

// branded types ensure we're always passing the result of the schema parse,
// otherwise you can mistakingly pass some arbitrary string
const ZodUrl = z.url().brand('URL');
type URL = z.infer<typeof ZodUrl>;

const validUrlsSchema = z.array(ZodUrl);

const safeFetchWithTimeout = async <T extends Record<string, unknown>>(
  url: URL,
  timeoutMs = 10_000
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      const message = await response.text();
      return {
        result: 'error',
        data: {
          status: response.status,
          message,
        },
      } as const;
    }
    const successResult = (await response.json()) as T;
    return {
      result: 'success',
      data: successResult,
    };
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
