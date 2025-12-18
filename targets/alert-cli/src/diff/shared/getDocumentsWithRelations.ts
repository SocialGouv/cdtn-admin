import type { DocumentInfo } from "@socialgouv/cdtn-types";
import { SourceKeys } from "@socialgouv/cdtn-utils";

import { getDocumentsWithRelationsBySource } from "./getAllDocumentsBySource";

export async function getDocumentsWithRelations(
  sources: SourceKeys[]
): Promise<Map<string, DocumentInfo[]>> {
  const documents = await getDocumentsWithRelationsBySource(sources);
  const docMapped = new Map<string, DocumentInfo[]>();
  for (const document of documents) {
    for (const doc of document.contentRelations) {
      const requestDocs = docMapped.get(doc.document.initialId);
      if (requestDocs) {
        requestDocs.push({
          id: document.cdtnId,
          source: document.source,
          title: document.title,
          slug: document.slug,
        });
      } else {
        docMapped.set(doc.document.initialId, [
          {
            id: document.cdtnId,
            source: document.source,
            title: document.title,
            slug: document.slug,
          },
        ]);
      }
    }
  }
  return docMapped;
}
