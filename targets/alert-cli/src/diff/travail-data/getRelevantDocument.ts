import { DocumentInfoWithCdtnRef, TravailDataChanges } from "@shared/types";
import { getDocumentsWithRelations } from "../shared/getDocumentsWithRelations";
import { SOURCES } from "@socialgouv/cdtn-sources";

export async function getRelevantTravailDocuments({
  modified,
  removed,
}: Pick<TravailDataChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const themeOrPrequalifiedDocs = await getDocumentsWithRelations([
    SOURCES.PREQUALIFIED,
    SOURCES.THEMES,
  ]);
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
