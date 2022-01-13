import type { GitTagData } from "../../../types";
import type { RelevantDocumentsFunction } from "../ReleventDocuments";
import type { DilaChanges } from "../type";
import { compareAgreementTree } from "./CompareAgreementTree";
import type { AgreementFileChange } from "./ProcessAgreementFileChanges";

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
      return {
        ...changes,
        documents,
        file: fileChange.file,
        id: fileChange.current.data.id,
        num: fileChange.current.data.num,
        title: fileChange.current.data.shortTitle,
      };
    })
  );
};

export default processAgreementChanges;
