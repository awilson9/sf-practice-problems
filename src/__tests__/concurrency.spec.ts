import { describe, expect, test, jest } from '@jest/globals';
import { conccurentlyFetchUrls } from '../concurrency/fetch-urls';
import { success } from 'zod';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const successCases = [
  { result: 'success', timeout: 0, data: 'yay' },
  { result: 'success', timeout: 100, data: 'we' },
  { result: 'success', timeout: 200, data: 'did' },
  { result: 'success', timeout: 300, data: 'it' },
  { result: 'success', timeout: 400, data: 'in' },
  { result: 'success', timeout: 500, data: 'order' },
  { result: 'success', timeout: 600, data: 'wahoo' },
  { result: 'error', timeout: 700, data: 'oops' },
  { result: 'error', timeout: 800, data: 'we' },
  { result: 'error', timeout: 900, data: 'failed' },
] as const;

const concurrency5Cases = [
  { result: 'success', timeout: 200, data: 'yay' },
  { result: 'success', timeout: 200, data: 'we' },
  { result: 'success', timeout: 200, data: 'did' },
  { result: 'success', timeout: 200, data: 'it' },
  { result: 'success', timeout: 200, data: 'in' },
  { result: 'success', timeout: 10_000, data: 'order' },
  { result: 'success', timeout: 10_000, data: 'wahoo' },
  { result: 'error', timeout: 10_000, data: 'oops' },
  { result: 'error', timeout: 10_000, data: 'we' },
  { result: 'error', timeout: 10_000, data: 'failed' },
] as const;

const formatSuccessCaseUrl = (res: {
  result: 'success' | 'error';
  timeout: number;
  data: string;
}) => `https://my.test.api.com/${res.result}/${res.timeout}/${res.data}`;

const createMock = () =>
  jest.fn(async (...params: Parameters<typeof global.fetch>) => {
    const testPath = (params[0] as string).split('/');
    const [resultType, waitForMs, resultValue] = testPath.slice(-3);
    const { statusCode, ok } = (() => {
      if (resultType === 'error') {
        return {
          statusCode: 500,
          ok: false,
        };
      }
      return {
        statusCode: 200,
        ok: true,
      };
    })();

    const timeout = parseInt(waitForMs);
    await delay(timeout);

    return Promise.resolve({
      text: async () => Promise.resolve(`{ "data": "${resultValue}" }`),
      status: statusCode,
      ok,
    }) as Partial<ReturnType<typeof global.fetch>> as ReturnType<typeof global.fetch>;
  });

describe('Concurrently fetch', () => {
  test('calls the success cases in order with max concurrency 1', async () => {
    const mockedFetch = createMock();
    jest.spyOn(global, 'fetch').mockImplementation(mockedFetch);
    const results = await conccurentlyFetchUrls(
      successCases.map((s) => formatSuccessCaseUrl(s)),
      1
    );
    const calls = mockedFetch.mock.calls;
    calls.forEach(([url], index) => {
      expect(url).toEqual(formatSuccessCaseUrl(successCases[index]));
    });
    results.forEach((result, index) => {
      const input = successCases[index];
      expect(result.result).toEqual(input.result);
      expect(result.data).toEqual({ data: input.data });
      expect(result.status).toEqual(input.result === 'success' ? 200 : 500);
    });
  });

  test('fails with invalid url', async () => {
    try {
      await conccurentlyFetchUrls(['not a url'], 1);
    } catch (err) {
      expect(true).toBe(true);
      return;
    }
    expect(true).toBe(false);
  });

  test('calls the test cases with concurrency 5', async () => {
    const mockedFetch = createMock();
    jest.spyOn(global, 'fetch').mockImplementation(mockedFetch);
    const resultPromise = conccurentlyFetchUrls(
      concurrency5Cases.map((s) => formatSuccessCaseUrl(s)),
      5
    );
    await delay(100);
    const calls = mockedFetch.mock.calls;
    expect(calls).toHaveLength(5);

    await resultPromise;
    const callsAfterDelay = mockedFetch.mock.calls;
    expect(callsAfterDelay).toHaveLength(10);
  }, 20_000);
});
