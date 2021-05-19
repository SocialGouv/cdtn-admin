import getContribReferences from "./extractDilaReferences/contribution";
import getTravailEmploiReferences from "./extractDilaReferences/ficheTravailEmploi";

export async function getRelevantDocuments({
  modified,
  removed,
}: alerts.AstChanges): Promise<alerts.DocumentReferences[]> {
  const contribReferences = await getContribReferences();
  const travailEmploiReferences = await getTravailEmploiReferences();

  const docsReferences = contribReferences.concat(travailEmploiReferences);
  const documents = docsReferences.flatMap((item) => {
    const references = item.references.filter(
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

    if (references.length) {
      return { document: item.document, references };
    }
    return [];
  });
  return documents;
}
