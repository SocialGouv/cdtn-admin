export function chunk<T>(array: Array<T>, chunkSize = 50): Array<Array<T>> {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}
