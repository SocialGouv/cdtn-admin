import { DiffFile, LoadFileFn } from "../types";
import { GitTagData } from "../types";

export function getFilename(patch: DiffFile): string {
  return patch.filename;
}

export function createToJson<T>(loadFile: LoadFileFn) {
  return async (fileDiff: DiffFile, tag: GitTagData): Promise<T> =>
    loadFile(fileDiff, tag).then((blob) => JSON.parse(blob.toString()) as T);
}
