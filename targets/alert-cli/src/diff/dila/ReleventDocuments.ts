import getContribReferences from "../../extractDilaReferences/contribution";
import getEditorialContentReferences from "../../extractDilaReferences/editorialContents";
import getTravailEmploiReferences from "../../extractDilaReferences/ficheTravailEmploi";
import getMailTemplateReferences from "../../extractDilaReferences/mailTemplates";
import type { RelevantDocumentsFunction } from "./types";

export const getRelevantDocuments: RelevantDocumentsFunction = async ({
  modified,
  removed,
}) => {
  const contribReferences = await getContribReferences();
  const travailEmploiReferences = await getTravailEmploiReferences();
  const mailTemplateRef = await getMailTemplateReferences();
  const editorialContentRef = await getEditorialContentReferences();
  const docsReferences = contribReferences.concat(
    travailEmploiReferences,
    mailTemplateRef,
    editorialContentRef
  );
  return docsReferences.flatMap((item) => {
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
};
