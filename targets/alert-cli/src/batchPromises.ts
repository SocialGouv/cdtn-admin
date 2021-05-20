export async function batchPromises<A, Result>(
  items: A[],
  handler: (a: A) => Promise<Result>,
  batchSize: number
): Promise<PromiseSettledResult<Result>[]> {
  const array = items.slice();

  let results: PromiseSettledResult<Result>[] = [];

  while (array.length) {
    const res = await Promise.allSettled(
      array.splice(0, batchSize).map(handler)
    );
    results = results.concat(res);
  }
  return results;
}
