import { RelevantDocumentsExtractor } from "../dila/ReleventDocuments";
import { DilaChanges, DocumentReferences } from "@shared/types";

export class RelevantDocumentsExtractorStub
  implements RelevantDocumentsExtractor
{
  extractReferences({
    modified,
    removed,
  }: Pick<DilaChanges, "modified" | "removed">): Promise<DocumentReferences[]> {
    return Promise.resolve([]);
  }
}
