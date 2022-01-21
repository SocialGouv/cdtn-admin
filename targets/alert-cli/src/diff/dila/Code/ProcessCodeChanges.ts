import type { GitTagData } from "../../../types";
import { compareTree } from "../CompareTree";
import type { DilaChanges, RelevantDocumentsFunction } from "../types";
import type { CodeFileChange } from "./types";

const processCodeChanges = async (
  tag: GitTagData,
  fileChanges: CodeFileChange[],
  getRelevantDocuments: RelevantDocumentsFunction
): Promise<DilaChanges[]> => {
  return Promise.all(
    fileChanges.map(async (fileChange) => {
      const changes = compareTree<CodeFileChange>(fileChange);

      const documents = await getRelevantDocuments(changes);
      if (documents.length > 0) {
        console.log(
          `[info] found ${documents.length} documents impacted by release ${tag.ref} on legi-data`,
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
        title: data.title,
      };
    })
  );
};

export default processCodeChanges;
