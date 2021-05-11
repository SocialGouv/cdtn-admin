export function formatIdcc(num: number) {
  return `0000${num}`.slice(-4);
}
