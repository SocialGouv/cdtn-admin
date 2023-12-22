import type {
  DocumentInfoWithCdtnRef,
  TravailDataChanges,
} from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";

import { getDocumentsWithRelations } from "../../shared/getDocumentsWithRelations";

export async function getRelevantMtDocumentsThemeAndPrequalified({
  modified,
  removed,
}: Pick<TravailDataChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const modifiedAndRemoved = [...modified, ...removed];

  const themeAndPrequalifiedDocs = await getDocumentsWithRelations([
    SOURCES.PREQUALIFIED,
    SOURCES.THEMES,
  ]);
  const themeAndPrequaliedRelevantDoc = modifiedAndRemoved.flatMap((doc) => {
    const documents = themeAndPrequalifiedDocs.get(doc.pubId);
    if (documents) {
      return documents.map((requestInfo) => {
        return {
          ...requestInfo,
          ref: { id: doc.pubId, title: doc.title },
        };
      });
    }
    return [];
  });

  return themeAndPrequaliedRelevantDoc;
}
