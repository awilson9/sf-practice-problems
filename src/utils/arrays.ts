export const arrayOfSize = (size: number, fillWith?: string) => {
  try {
    return Array(size).fill(fillWith ?? null);
  } catch (err) {
    throw new Error(`invalid array range ${size}`, { cause: err });
  }
};
