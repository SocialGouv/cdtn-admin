import type { Code } from "@socialgouv/legi-data-types";

import type { GitTagData } from "../../../types";
import { compareDilaContent } from "../CompareDilaContent";
import type { DilaChanges } from "../types";
import type { CodeFileChange } from "./types";
import { RelevantDocumentsExtractor } from "../RelevantDocuments";

const processCodeChanges = async (
  tag: GitTagData,
  fileChanges: CodeFileChange[],
  extractor: RelevantDocumentsExtractor
): Promise<DilaChanges[]> => {
  return Promise.all(
    fileChanges.map(async (fileChange) => {
      const changes = compareDilaContent<Code>(
        fileChange.previous,
        fileChange.current
      );

      const documents = await extractor.extractReferences(changes);
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
