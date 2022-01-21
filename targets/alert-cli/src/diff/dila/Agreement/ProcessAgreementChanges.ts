import type { GitTagData } from "../../../types";
import { compareTree } from "../CompareTree";
import type { DilaChanges, RelevantDocumentsFunction } from "../types";
import type { AgreementFileChange } from "./types";

const processAgreementChanges = async (
  tag: GitTagData,
  fileChanges: AgreementFileChange[],
  getRelevantDocuments: RelevantDocumentsFunction
): Promise<DilaChanges[]> => {
  return Promise.all(
    fileChanges.map(async (fileChange) => {
      const changes = compareTree<AgreementFileChange>(fileChange);
      const documents = await getRelevantDocuments(changes);

      const data = fileChange.current
        ? fileChange.current.data
        : fileChange.previous?.data;

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
