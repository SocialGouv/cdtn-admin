import { DocumentElasticWithSource } from "@shared/types";

export interface RelatedDocuments {
  [id: string]: DocumentElasticWithSource<any>[];
}

export const populateRelatedDocuments = (
  allDocuments: DocumentElasticWithSource<any>[],
  relatedIdsDocuments: string[]
): RelatedDocuments => {
  const relatedDocuments: RelatedDocuments = {};
  relatedIdsDocuments.forEach((id) => {
    relatedDocuments[id] = allDocuments.filter((doc) => doc.cdtnId === id);
  });
  return relatedDocuments;
};
