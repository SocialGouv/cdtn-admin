import getContribReferences from "../extractReferences/contribution";
import { DocumentReferences } from "@shared/types";

export interface RelevantDocumentsExtractor {
  extractReferences({
    modified,
    removed,
  }: Pick<DilaChanges, "modified" | "removed">): Promise<DocumentReferences[]>;
}

export class RelevantDocumentsExtractorImpl
  implements RelevantDocumentsExtractor
{
  async extractReferences({
    modified,
    removed,
  }: Pick<DilaChanges, "modified" | "removed">): Promise<DocumentReferences[]> {
    const contribReferences = await getContribReferences();
    return contribReferences.flatMap((item) => {
      const references = item.references.filter(
        (ref) =>
          modified.find(
            (node) => node.id === ref.dila_id || node.cid === ref.dila_cid
          ) ??
          removed.find(
            (node) => node.id === ref.dila_id || node.cid === ref.dila_cid
          )
      );

      if (references.length > 0) {
        return [{ document: item.document, references }];
      }
      return [];
    });
  }
}
