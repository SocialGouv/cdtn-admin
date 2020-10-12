import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// mjs equivalent for __dirname
// https://stackoverflow.com/a/50052194
const _dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 *
 * @param {string} file
 */
export async function getJson(file) {
  const filePath = path.join(_dirname, "..", "..", "data", ...file.split("/"));
  const data = (await readFile(filePath)).toString();
  return JSON.parse(data);
}
