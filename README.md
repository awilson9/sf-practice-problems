# SF practice problems

Contains implementation of 2 practice problems, generating license plate numbers
and concurrently fetching urls. Problem statements are located in the main test
problem files

- `src/concurrency

This repo uses `pnpm` as it's package manager.

See [installation instructions](https://pnpm.io/installation) if you don't have
pnpm installed

## Setup

`pnpm install` and you're good to go.

There are debugging log calls inside of the functions, which are disabled by
default. If you want excessive logging just update `LOG_EVERYTHING` in `.env`

## Executing

There are 2 utility scripts to actually execute the functions if you like, see
the file location of the input values if you want to play around with other
values

- License plate function
  - `pnpm license-plate`
  - the inputs are defined in
    `src/license-plates/run-get-license-plate-in-sequence.ts`,
- Concurrency function
  - `pnpm concurrently-fetch`
  - the inputs are defined in `src/concurrency/run-fetch-urls.ts`,

## Unit tests

Unit tests are located in `src/__tests__`, are implemented with jest. you can
execute them with `pnpm test`
