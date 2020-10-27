/**
 *
 * @param {string | number} num
 * @returns {string}
 */
export function formatIdcc(num) {
  return `0000${num}`.slice(-4);
}
