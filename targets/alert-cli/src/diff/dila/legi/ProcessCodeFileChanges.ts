import type { Code } from "@socialgouv/legi-data-types";

import { createToJson } from "../../../utils/node-git.helpers";
import type { CodeFileChange } from "./types";
import { Diff, DiffFile, LoadFileFn } from "../../../types";
import { GitTagData } from "../../../types";

const codeFileChanges = async (
  file: DiffFile,
  loadFile: LoadFileFn,
  from: GitTagData,
  to: GitTagData
): Promise<CodeFileChange> => {
  const toAst = createToJson<Code>(loadFile);
  const [current, previous] = await Promise.all([
    toAst(file, to),
    toAst(file, from),
  ]);
  return {
    current,
    file: file.filename,
    previous,
    type: "legi" as const,
  };
};

const processCodeFileChanges = async (
  diff: Diff,
  fileFilter: (path: string) => boolean,
  loadFile: LoadFileFn
): Promise<CodeFileChange[]> => {
  const filteredPatches = diff.files.filter((patch) =>
    fileFilter(patch.filename)
  );
  return Promise.all(
    filteredPatches.map(async (patch) =>
      codeFileChanges(patch, loadFile, diff.from, diff.to)
    )
  );
};

export default processCodeFileChanges;
