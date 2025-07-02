import type { Agreement } from "@socialgouv/kali-data-types";

import { createToJson, getFilename } from "../../../utils/node-git.helpers";
import type { AgreementFileChange } from "./types";
import { Diff, DiffFile, LoadFileFn, GitTagData } from "../../../types";

const agreementFileChange = async (
  file: DiffFile,
  version: GitTagData,
  loadFile: LoadFileFn
): Promise<Agreement> => {
  return createToJson<Agreement>(loadFile)(file, version);
};

const processAgreementFileChanges = async (
  patches: Diff,
  fileFilter: (path: string) => boolean,
  loadFile: LoadFileFn
): Promise<AgreementFileChange[]> => {
  const filteredPatches = patches.files.filter((patch) =>
    fileFilter(getFilename(patch))
  );

  return Promise.all(
    filteredPatches.map(async (patch) => {
      const file = patch.filename;
      const change: AgreementFileChange = {
        file,
        type: "kali" as const,
      };
      if (patch.status === "added" || patch.status === "modified") {
        change.current = await agreementFileChange(patch, patches.to, loadFile);
      }
      if (patch.status === "removed" || patch.status === "modified") {
        change.previous = await agreementFileChange(
          patch,
          patches.from,
          loadFile
        );
      }
      return change;
    })
  );
};

export default processAgreementFileChanges;
