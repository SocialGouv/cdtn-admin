export function chunk<T>(array: Array<T>, chunkSize = 50): Array<Array<T>> {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

export function chunkText(text: string, chunkSize = 50): string[] {
  if (text.length === 0) {
    return [];
  }

  const chunks = [];
  let currentChunk = "";

  for (const word of text.split(" ")) {
    if (currentChunk.length + word.length + 1 <= chunkSize) {
      currentChunk += (currentChunk.length === 0 ? "" : " ") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
