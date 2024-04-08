import {
  createIndex,
  indexDocumentsBatched,
  suggestionMapping,
} from "@socialgouv/cdtn-elasticsearch";
import fs from "fs";
import { join } from "path";
import readline from "readline";

import { context } from "./context";

async function pushSuggestions({ client, indexName, data }: any) {
  const BUFFER_SIZE = context.get("bufferSize") || 20000;

  const mappedSuggestions = data.map((entity: any) => {
    return { ranking: entity.value, title: entity.entity };
  });

  await indexDocumentsBatched({
    client,
    documents: mappedSuggestions,
    indexName,
    size: BUFFER_SIZE,
  });
}

export async function populateSuggestions(
  client: any,
  indexName: any,
  suggestFile = "./dataset/suggestions.txt",
  bufferSize = 20000
) {
  const SUGGEST_FILE = context.get("suggestFile") || suggestFile;
  const BUFFER_SIZE = context.get("bufferSize") || bufferSize;
  await createIndex({
    client,
    indexName,
    mappings: suggestionMapping,
  });

  const promiseStream = new Promise((resolve) => {
    const stream = readline.createInterface({
      input: fs.createReadStream(join(process.cwd(), SUGGEST_FILE)),
    });

    let suggestionsBuffer: any = [];
    stream.on("line", async function (line) {
      // parse JSON representing a suggestion entity {entity: suggestion, value: weight}
      const entity = JSON.parse(line);
      suggestionsBuffer.push(entity);
      if (suggestionsBuffer.length >= BUFFER_SIZE) {
        // create an immutable copy of the array
        const suggestions = suggestionsBuffer.slice();
        suggestionsBuffer = [];
        await pushSuggestions({ client, data: suggestions, indexName });
      }
    });

    stream.on("close", async function () {
      if (suggestionsBuffer.length > 0) {
        await pushSuggestions({ client, data: suggestionsBuffer, indexName });
        resolve("");
      }
    });
  });

  await promiseStream;
}
