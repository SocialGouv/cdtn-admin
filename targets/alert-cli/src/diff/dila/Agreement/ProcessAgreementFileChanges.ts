import type { Agreement } from "@socialgouv/kali-data-types";
import type { ConvenientPatch, Tree } from "nodegit";

import { createToJson, getFilename } from "../../../node-git.helpers";
import type { AgreementFileChange } from "./types";

const agreementFileChange = async (
  file: string,
  tree: Tree
): Promise<Agreement> => {
  return createToJson<Agreement>(file)(tree);
};

const processAgreementFileChanges = async (
  patches: ConvenientPatch[],
  fileFilter: (path: string) => boolean,
  prevTree: Tree,
  currTree: Tree
): Promise<AgreementFileChange[]> => {
  const filteredPatches = patches.filter((patch) =>
    fileFilter(getFilename(patch))
  );

  return Promise.all(
    filteredPatches.map(async (patch) => {
      const file = patch.newFile().path();
      const change: AgreementFileChange = {
        file,
        type: "kali" as const,
      };
      if (patch.isAdded() || patch.isModified()) {
        change.current = await agreementFileChange(file, currTree);
      }
      if (patch.isDeleted() || patch.isModified()) {
        change.previous = await agreementFileChange(file, prevTree);
      }
      return change;
    })
  );
};

export default processAgreementFileChanges;
