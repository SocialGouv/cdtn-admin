import type { DocumentInfoWithCdtnRef, VddChanges } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";

import { getDocumentsWithRelations } from "../shared/getDocumentsWithRelations";

export async function getRelevantSpDocuments({
  modified,
  removed,
}: Pick<VddChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const themeOrPrequalifiedDocs = await getDocumentsWithRelations([
    SOURCES.PREQUALIFIED,
    SOURCES.THEMES,
  ]);
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
