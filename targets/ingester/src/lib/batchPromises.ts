export async function batchPromises<A, Result>(
  items: A[],
  handler: (a: A) => Promise<Result>,
  batchSize: number
): Promise<Result[]> {
  const array = items.slice();
  let results: Result[] = [];
  while (array.length) {
    const res = await Promise.all(array.splice(0, batchSize).map(handler));
    results = results.concat(res);
  }
  return results;
}

export function chunk<A>(items: A[], chunkSize: number): A[][] {
  const results = [];
  const array = items.slice();
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
}
