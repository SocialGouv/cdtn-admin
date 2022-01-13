import type { Code } from "@socialgouv/legi-data-types";
import type { ConvenientPatch, Tree } from "nodegit";

import { createToJson } from "../../../node-git.helpers";

export type CodeFileChange = {
  type: "legi";
  current: Code;
  previous: Code;
  file: string;
};

const codeFileChanges = async (
  file: string,
  prevTree: Tree,
  currTree: Tree
): Promise<CodeFileChange> => {
  const toAst = createToJson<Code>(file);
  const [current, previous] = await Promise.all(
    [currTree, prevTree].map(toAst)
  );
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
