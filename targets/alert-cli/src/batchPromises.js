/**
 * @template A
 * @template B
 * @param {A[]} items
 * @param {(a:A) => Promise<B>} handler
 * @param {number} batchSize
 */
export async function batchPromises(items, handler, batchSize) {
  const array = items.slice();
  /** @type {({status: "rejected", reason:Object} | {status:"fullfilled", value:B})[]} */
  let results = [];
  let i = 0;
  while (array.length) {
    const res = await Promise.allSettled(
      array.splice(0, batchSize).map(handler)
    );
    console.log(`Performed operation for batch ${++i}.`);
    results = results.concat(res);
  }
  return results;
}
