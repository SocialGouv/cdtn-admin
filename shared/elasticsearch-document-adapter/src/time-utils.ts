export const getTimeInMs = (hrtime: any): number => {
  return Math.round(hrtime[0] * 1_000 + hrtime[1] / 1_000_000);
};
