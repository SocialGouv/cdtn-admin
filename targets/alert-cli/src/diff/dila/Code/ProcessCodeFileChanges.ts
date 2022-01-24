import type { Code } from "@socialgouv/legi-data-types";
import type { ConvenientPatch, Tree } from "nodegit";

import { createToJson } from "../../../node-git.helpers";
import type { CodeFileChange } from "./types";

const codeFileChanges = async (
  file: string,
  prevTree: Tree,
  currTree: Tree
): Promise<CodeFileChange> => {
  const toAst = createToJson<Code>(file);
  const [current, previous] = await Promise.all(
    [currTree, prevTree].map(toAst)
  );
  if (!current) {
    throw new Error(
      "This means that a file has been deleted. In Legi Code case, it should never happens as the data files are fixed."
    );
  }
  if (!previous) {
    throw new Error(
      "This means that a file has been added. In Legi Code case, it should never happens as the data files are fixed"
    );
  }
  return {
    current,
    file,
    previous,
    type: "legi" as const,
  };
};

const processCodeFileChanges = async (
  patches: ConvenientPatch[],
  fileFilter: (path: string) => boolean,
  prevTree: Tree,
  currTree: Tree
): Promise<CodeFileChange[]> => {
  const filteredPatches = patches.filter((patch) =>
    fileFilter(patch.newFile().path())
  );
  return Promise.all(
    filteredPatches.map(async (patch) =>
      codeFileChanges(patch.newFile().path(), prevTree, currTree)
    )
  );
};

export default processCodeFileChanges;
