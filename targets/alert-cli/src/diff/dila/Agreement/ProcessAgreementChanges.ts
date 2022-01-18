import type { GitTagData } from "../../../types";
import type { DilaChanges, RelevantDocumentsFunction } from "../types";
import { compareAgreementTree } from "./CompareAgreementTree";
import type { AgreementFileChange } from "./types";

const processAgreementChanges = async (
  tag: GitTagData,
  fileChanges: AgreementFileChange[],
  getRelevantDocuments: RelevantDocumentsFunction
): Promise<DilaChanges[]> => {
  return Promise.all(
    fileChanges.map(async (fileChange) => {
      const changes = compareAgreementTree(fileChange);
      const documents = await getRelevantDocuments(changes);
      if (documents.length > 0) {
        console.log(
          `[info] found ${documents.length} documents impacted by release ${tag.ref} on kali-data, (idcc: ${fileChange.current.data.num})`,
          { file: fileChange.file }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const data = fileChange.current.data
        ? fileChange.current.data
        : fileChange.previous.data;

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
