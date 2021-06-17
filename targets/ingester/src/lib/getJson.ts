import { readFile } from "fs/promises";
import path from "path";

export async function getJson<Result>(file: string): Promise<Result> {
  const filePath = path.join(process.cwd(), "data", ...file.split("/"));
  const data = (await readFile(filePath)).toString();
  return JSON.parse(data) as Result;
}
