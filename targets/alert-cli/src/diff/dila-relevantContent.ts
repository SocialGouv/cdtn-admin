import type { DilaChanges, DocumentReferences } from "@shared/types";

import getContribReferences from "../extractDilaReferences/contribution";
import getEditorialContentReferences from "../extractDilaReferences/editorialContents";
import getTravailEmploiReferences from "../extractDilaReferences/ficheTravailEmploi";
import getMailTemplateReferences from "../extractDilaReferences/mailTemplates";

export async function getRelevantDocuments({
  modified,
  removed,
}: Pick<DilaChanges, "modified" | "removed">): Promise<DocumentReferences[]> {
  const contribReferences = await getContribReferences();
  const travailEmploiReferences = await getTravailEmploiReferences();
  const mailTemplateRef = await getMailTemplateReferences();
  const editorialContentRef = await getEditorialContentReferences();
  const docsReferences = contribReferences.concat(
    travailEmploiReferences,
    mailTemplateRef,
    editorialContentRef
  );
  const documents = docsReferences.flatMap((item) => {
    const references = item.references.filter(
      (ref) =>
        modified.find(
          (node) => node.id === ref.dila_id || node.cid === ref.dila_cid
        ) ??
        removed.find(
          (node) => node.id === ref.dila_id || node.cid === ref.dila_cid
        )
    );

    if (references.length > 0) {
      return [{ document: item.document, references }];
    }
    return [];
  });
  return documents;
}
