/**
 * @template A
 * @template B
 * @param {A[]} items
 * @param {(a:A) => Promise<B>} handler
 * @param {number} batchSize
 */
export async function batchPromises(items, handler, batchSize) {
  const array = items.slice();
  /** @type {PromiseSettledResult<B>[]} */
  let results = [];
  while (array.length) {
    const res = await Promise.allSettled(
      array.splice(0, batchSize).map(handler)
    );
    results = results.concat(res);
  }
  return results;
}

/**
 * @template A
 * @template B
 * @param {A[]} items
 * @param {Number} chunkSize
 */
export function chunk(items, chunkSize) {
  const results = [];
  const array = items.slice();
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
}
