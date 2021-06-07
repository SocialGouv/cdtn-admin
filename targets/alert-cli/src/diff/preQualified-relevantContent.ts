import type {
  DocumentInfo,
  TravailDataChanges,
  VddChanges,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";

import { getDocumentsWithRelationsBySource } from "../extractDilaReferences/getAllDocumentsBySource";

async function _getPrequalifiedDocuments() {
  const prequalifieds = await getDocumentsWithRelationsBySource(
    SOURCES.PREQUALIFIED
  );
  const prequalifiedMap = new Map<string, DocumentInfo[]>();
  for (const prequalified of prequalifieds) {
    for (const doc of prequalified.contentRelations) {
      const requestDocs = prequalifiedMap.get(doc.document.initialId);
      if (requestDocs) {
        requestDocs.push({
          id: prequalified.cdtnId,
          source: SOURCES.PREQUALIFIED,
          title: prequalified.title,
        });
      } else {
        prequalifiedMap.set(doc.document.initialId, [
          {
            id: prequalified.cdtnId,
            source: SOURCES.PREQUALIFIED,
            title: prequalified.title,
          },
        ]);
      }
    }
  }
  return prequalifiedMap;
}

const getPrequalifiedDocuments = memoizee(_getPrequalifiedDocuments, {
  promise: true,
});

export async function vddPrequalifiedRelevantDocuments({
  modified,
  removed,
}: Pick<VddChanges, "modified" | "removed">): Promise<DocumentInfo[]> {
  const prequalifiedRequests = await getPrequalifiedDocuments();
  return modified
    .flatMap((doc) => {
      const prequalifieds = prequalifiedRequests.get(doc.id);
      if (prequalifieds) return prequalifieds;
      return [];
    })
    .concat(
      removed.flatMap((doc) => {
        const prequalifieds = prequalifiedRequests.get(doc.id) && [];
        if (prequalifieds) return prequalifieds;
        return [];
      })
    );
}

export async function ficheTravailPrequalifiedRelevantDocuments({
  modified,
  removed,
}: Pick<TravailDataChanges, "modified" | "removed">): Promise<DocumentInfo[]> {
  const prequalifiedRequests = await getPrequalifiedDocuments();
  return modified
    .flatMap((doc) => {
      const prequalifieds = prequalifiedRequests.get(doc.pubId);
      if (prequalifieds) return prequalifieds;
      return [];
    })
    .concat(
      removed.flatMap((doc) => {
        const prequalifieds = prequalifiedRequests.get(doc.pubId) && [];
        if (prequalifieds) return prequalifieds;
        return [];
      })
    );
}
