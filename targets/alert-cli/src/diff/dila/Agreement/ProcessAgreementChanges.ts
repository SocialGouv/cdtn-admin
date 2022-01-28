import type { Agreement, AgreementData } from "@socialgouv/kali-data-types";

import type { GitTagData } from "../../../types";
import {
  compareDilaContent,
  convertToDilaAdded,
  convertToDilaRemoved,
} from "../CompareDilaContent";
import type { Diff, DilaChanges, RelevantDocumentsFunction } from "../types";
import type { AgreementFileChange } from "./types";

function extractChanges(fileChange: AgreementFileChange): {
  changes: Diff;
  data: NonNullable<AgreementData>;
} {
  if (!fileChange.current && fileChange.previous) {
    return {
      changes: convertToDilaRemoved(fileChange.previous),
      data: fileChange.previous.data,
    };
  }

  if (fileChange.current && !fileChange.previous) {
    return {
      changes: convertToDilaAdded(fileChange.current),
      data: fileChange.current.data,
    };
  }

  if (fileChange.current && fileChange.previous) {
    return {
      changes: compareDilaContent<Agreement>(
        fileChange.previous,
        fileChange.current
      ),
      data: fileChange.current.data,
    };
  }

  throw new Error(
    "Both current & previous are empty. This should never happen as we are processing file changes so we should always have at least current or previous defined."
  );
}

const processAgreementChanges = async (
  tag: GitTagData,
  fileChanges: AgreementFileChange[],
  getRelevantDocuments: RelevantDocumentsFunction
): Promise<DilaChanges[]> => {
  return Promise.all(
    fileChanges.map(async (fileChange) => {
      const { changes, data } = extractChanges(fileChange);
      const documents = await getRelevantDocuments(changes);

      if (documents.length > 0) {
        console.log(
          `[info] found ${documents.length} documents impacted by release ${tag.ref} on kali-data, (idcc: ${data.num})`,
          { file: fileChange.file }
        );
      }

      return {
        ...changes,
        documents,
        file: fileChange.file,
        id: data.id,
        num: data.num,
        title: data.shortTitle,
      };
    })
  );
};

export default processAgreementChanges;
