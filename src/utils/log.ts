const shouldLog = process.env.LOG_EVERYTHING === 'true';

export const log = (message: string, meta: any, override = shouldLog) => {
  if (!override) {
    return;
  }
  console.log(message, JSON.stringify(meta, null, 2));
};
