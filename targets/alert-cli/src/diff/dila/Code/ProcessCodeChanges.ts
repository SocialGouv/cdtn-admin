import type { GitTagData } from "../../../types";
import type { RelevantDocumentsFunction } from "../ReleventDocuments";
import type { DilaChanges } from "../type";
import { compareCodeTree } from "./CompareCodeTree";
import type { CodeFileChange } from "./ProcessCodeFileChanges";

const processCodeChanges = async (
  tag: GitTagData,
  fileChanges: CodeFileChange[],
  getRelevantDocuments: RelevantDocumentsFunction
): Promise<DilaChanges[]> => {
  return Promise.all(
    fileChanges.map(async (fileChange) => {
      const changes = compareCodeTree(fileChange);

      const documents = await getRelevantDocuments(changes);
      if (documents.length > 0) {
        console.log(
          `[info] found ${documents.length} documents impacted by release ${tag.ref} on legi-data`,
          { file: fileChange.file }
        );
      }
      return {
        ...changes,
        documents,
        file: fileChange.file,
        id: fileChange.current.data.id,
        title: fileChange.current.data.title,
      };
    })
  );
};

export default processCodeChanges;
