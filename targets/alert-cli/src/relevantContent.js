import getContribReferences from "./extractDilaReferences/contribution";
import getTravailEmploiReferences from "./extractDilaReferences/ficheTravailEmploi";

/**
 * @param {alerts.AstChanges} changes
 */
export async function getRelevantDocuments({ added, modified, removed }) {
  const contribReferences = await getContribReferences();
  const travailEmploiReferences = await getTravailEmploiReferences();

  const references = contribReferences.concat(travailEmploiReferences);
  const documents = references.flatMap((item) => {
    const references = item.references.filter(
      (ref) =>
        modified.find(
          (node) =>
            node.data.id === ref.dila_id || node.data.cid === ref.dila_cid
        ) ||
        removed.find(
          (node) =>
            node.data.id === ref.dila_id || node.data.cid === ref.dila_cid
        ) ||
        // added articles can be an old article which version has bumped
        // so id is new but cid hasn't change
        added.find((node) => node.data.cid === ref.dila_cid)
    );

    if (references.length) {
      return { document: item.document, references };
    }
    return [];
  });
  return documents;
}
