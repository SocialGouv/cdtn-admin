import type { ConvenientPatch, Tree } from "nodegit";

export function getFilename(patch: ConvenientPatch): string {
  return patch.newFile().path();
}

export function createToJson<T>(file: string) {
  return async (tree: Tree): Promise<T> =>
    tree
      .getEntry(file)
      .then(async (entry) => entry.getBlob())
      .then((blob) => JSON.parse(blob.toString()) as T);
}
