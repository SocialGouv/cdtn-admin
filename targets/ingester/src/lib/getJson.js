import { readFile } from "fs/promises";
import path from "path";

/**
 *
 * @param {string} file
 */
export async function getJson(file) {
  const filePath = path.join(process.cwd(), "data", ...file.split("/"));
  const data = (await readFile(filePath)).toString();
  return JSON.parse(data);
}
