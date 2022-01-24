import type { ConvenientPatch, Tree } from "nodegit";

export function getFilename(patch: ConvenientPatch): string {
  return patch.newFile().path();
}

export function createToJson<T>(file: string) {
  return async (tree: Tree): Promise<T | null> =>
    tree
      .getEntry(file)
      .then(async (entry) => entry.getBlob())
      .then((blob) => JSON.parse(blob.toString()) as T)
      .catch((e) => {
        if (!e.message?.match(/does not exist in the given tree/)) throw e;
        return null;
      });
}
