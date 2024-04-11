import { DocumentElasticWithSource, EditorialContentDoc } from "@shared/types";
import { getContentBlockIds } from "./getContentBlockIds";

export const getRelatedIdsDocuments = (
  documents: DocumentElasticWithSource<EditorialContentDoc>[]
): string[] => {
  const ids: string[] = [];
  documents.forEach((document) => {
    if (document.contents) {
      const cdtnIdsToFetch = getContentBlockIds(document.contents);
      ids.push(...cdtnIdsToFetch);
    }
  });
  return Array.from(new Set(ids));
};
