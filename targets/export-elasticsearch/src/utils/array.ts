export function chunk<T>(array: Array<T>, chunkSize = 50): Array<Array<T>> {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

export function chunkText(text: string, chunkSize = 5000): Array<string> {
  const results = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    results.push(text.slice(i, i + chunkSize));
  }
  return results;
}
