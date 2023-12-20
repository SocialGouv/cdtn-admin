import type { DocumentInfoWithCdtnRef, VddChanges } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";

import { getDocumentsWithRelations } from "../shared/getDocumentsWithRelations";
import { queryContributionsWithFicheSp } from "./queryContribution";

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
  const themeOrPrequalifiedDataModified = modified.flatMap((doc) => {
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
  });
  const themeOrPrequalifiedDataRemoved = removed.flatMap((doc) => {
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
  });

  const contributions = await queryContributionsWithFicheSp();
  const contributionsRelevantDoc = contributions.flatMap((item) => {
    const ficheSpId = item.content_fiche_sp?.initial_id;
    const doc =
      modified.find((node) => node.id === ficheSpId) ??
      removed.find((node) => node.id === ficheSpId);

    if (doc) {
      const res: DocumentInfoWithCdtnRef = {
        ref: { id: doc.id, title: doc.title },
        id: item.id,
        title: item.question.content,
        source: "contributions",
      };
      return [res];
    }
    return [];
  });

  return [
    ...themeOrPrequalifiedDataModified,
    ...themeOrPrequalifiedDataRemoved,
    ...contributionsRelevantDoc,
  ];
}
