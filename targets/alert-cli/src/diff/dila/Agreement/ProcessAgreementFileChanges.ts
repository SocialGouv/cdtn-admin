import type { Agreement } from "@socialgouv/kali-data-types";
import type { ConvenientPatch, Tree } from "nodegit";

import { createToJson } from "../../../node-git.helpers";
import type { AgreementFileChange } from "./types";

const agreementFileChanges = async (
  file: string,
  prevTree: Tree,
  currTree: Tree
): Promise<AgreementFileChange> => {
  const toAst = createToJson<Agreement>(file);
  const [current, previous] = await Promise.all(
    [currTree, prevTree].map(toAst)
  );
  return {
    current,
    file,
    previous,
    type: "kali" as const,
  };
};

const processAgreementFileChanges = async (
  patches: ConvenientPatch[],
  fileFilter: (path: string) => boolean,
  prevTree: Tree,
  currTree: Tree
): Promise<AgreementFileChange[]> => {
  const filteredPatches = patches.filter((patch) =>
    fileFilter(patch.newFile().path())
  );

  return Promise.all(
    filteredPatches.map(async (patch) =>
      agreementFileChanges(patch.newFile().path(), prevTree, currTree)
    )
  );
};

export default processAgreementFileChanges;
