export function formatIdcc(num: number): string {
  return `0000${num}`.slice(-4);
}
