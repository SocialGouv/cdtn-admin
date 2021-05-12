import nodegit, { Tree } from "nodegit";

export function getFilename(patch: nodegit.ConvenientPatch) {
  return patch.newFile().path();
}

export function createToJson<T>(file: string) {
  return (tree: Tree): Promise<T> =>
    tree
      .getEntry(file)
      .then((entry) => entry.getBlob())
      .then((blob) => JSON.parse(blob.toString()));
}
