import type {
  DocumentInfo,
  DocumentInfoWithCdtnRef,
  TravailDataChanges,
  VddChanges,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";

import { getDocumentsWithRelationsBySource } from "../extractDilaReferences/getAllDocumentsBySource";

async function _getDocumentsWithRelations() {
  const documents = await getDocumentsWithRelationsBySource([
    SOURCES.PREQUALIFIED,
    SOURCES.THEMES,
  ]);
  const prequalifiedMap = new Map<string, DocumentInfo[]>();
  for (const document of documents) {
    for (const doc of document.contentRelations) {
      const requestDocs = prequalifiedMap.get(doc.document.initialId);
      if (requestDocs) {
        requestDocs.push({
          id: document.cdtnId,
          source: document.source,
          title: document.title,
        });
      } else {
        prequalifiedMap.set(doc.document.initialId, [
          {
            id: document.cdtnId,
            source: document.source,
            title: document.title,
          },
        ]);
      }
    }
  }
  return prequalifiedMap;
}

const getDocumentsWithRelations = memoizee(_getDocumentsWithRelations, {
  promise: true,
});

export async function vddPrequalifiedRelevantDocuments({
  modified,
  removed,
}: Pick<VddChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const themeOrPrequalifiedDocs = await getDocumentsWithRelations();
  return modified
    .flatMap((doc) => {
      const documents = themeOrPrequalifiedDocs.get(doc.id);
      if (documents) {
        return documents.map((requestInfo) => {
          return {
            ...requestInfo,
            ref: { id: doc.id, title: doc.title },
          };
        });
      }
      return [];
    })
    .concat(
      removed.flatMap((doc) => {
        const documents = themeOrPrequalifiedDocs.get(doc.id);
        if (documents) {
          return documents.map((requestInfo) => {
            return {
              ...requestInfo,
              ref: { id: doc.id, title: doc.title },
            };
          });
        }
        return [];
      })
    );
}

export async function ficheTravailPrequalifiedRelevantDocuments({
  modified,
  removed,
}: Pick<TravailDataChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const themeOrPrequalifiedDocs = await getDocumentsWithRelations();
  return modified
    .flatMap((doc) => {
      const documents = themeOrPrequalifiedDocs.get(doc.pubId);
      if (documents) {
        return documents.map((requestInfo) => {
          return {
            ...requestInfo,
            ref: { id: doc.pubId, title: doc.title },
          };
        });
      }
      return [];
    })
    .concat(
      removed.flatMap((doc) => {
        const documents = themeOrPrequalifiedDocs.get(doc.pubId);
        if (documents) {
          return documents.map((requestInfo) => {
            return {
              ...requestInfo,
              ref: { id: doc.pubId, title: doc.title },
            };
          });
        }
        return [];
      })
    );
}
