import getContribReferences from "./extractDilaReferences/contribution";
import getTravailEmploiReferences from "./extractDilaReferences/ficheTravailEmploi";

/**
 * @param {alerts.AstChanges} changes
 */
export function getRelevantDocuments({ modified, removed }) {
  const references = getContribReferences().concat(
    getTravailEmploiReferences()
  );

  const documents = references.flatMap((item) => {
    const reference = item.references.find(
      (ref) =>
        modified.find(
          (node) =>
            node.data.id === ref.dila_id || node.data.cid === ref.dila_cid
        ) ||
        removed.find(
          (node) =>
            node.data.id === ref.dila_id || node.data.cid === ref.dila_cid
        )
    );
    if (reference) {
      return { document: item.document, reference };
    }
    return [];
  });
  return documents;
}
