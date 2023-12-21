import type { DocumentInfoWithCdtnRef, VddChanges } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";

import { getDocumentsWithRelations } from "../../shared/getDocumentsWithRelations";

export async function getRelevantSpDocumentsThemeAndPrequalified({
  modified,
  removed,
}: Pick<VddChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const modifiedAndRemoved = [...modified, ...removed];

  const themeAndPrequalifiedDocs = await getDocumentsWithRelations([
    SOURCES.PREQUALIFIED,
    SOURCES.THEMES,
  ]);
  const themeAndPrequaliedRelevantDoc = modifiedAndRemoved.flatMap((doc) => {
    const documents = themeAndPrequalifiedDocs.get(doc.id);
    if (documents) {
      return documents.map((requestInfo) => {
        return {
          ...requestInfo,
          ref: { id: doc.id, title: doc.title },
        };
      });
    }
    return [];
  });

  return themeAndPrequaliedRelevantDoc;
}
