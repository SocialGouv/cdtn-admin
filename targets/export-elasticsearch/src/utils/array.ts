export const diff = (a: string[], b: string[]): string[] => {
  return a.filter((x) => !b.includes(x));
};
