import {
  DocumentElasticWithSource,
  RelatedDocument,
} from "@socialgouv/cdtn-types";

export interface RelatedDocuments {
  [id: string]: RelatedDocument;
}

export const populateRelatedDocuments = (
  allDocuments: DocumentElasticWithSource<any>[],
  relatedIdsDocuments: string[]
): RelatedDocuments => {
  const relatedDocuments: RelatedDocuments = {};
  relatedIdsDocuments.forEach((id) => {
    const docFound = allDocuments.find((doc) => doc.cdtnId === id);
    if (!docFound) {
      throw new Error(`No document found for id ${id}`);
    }
    relatedDocuments[id] = {
      id: docFound.id,
      cdtnId: docFound.cdtnId,
      breadcrumbs: docFound.breadcrumbs,
      title: docFound.title,
      slug: docFound.slug,
      source: docFound.source,
      description: docFound.description ?? docFound.text,
      icon: docFound.icon,
      action: docFound.action,
    };
  });
  return relatedDocuments;
};
