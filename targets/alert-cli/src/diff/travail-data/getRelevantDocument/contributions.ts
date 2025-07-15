import type {
  DocumentInfoWithCdtnRef,
  TravailDataChanges,
} from "@socialgouv/cdtn-types";

import { getContributionsCdtnReferences } from "../../shared/getContributionsCdtnReferences";

export async function getRelevantMtDocumentsContributions({
  modified,
  removed,
}: Pick<TravailDataChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const modifiedAndRemoved = [...modified, ...removed];

  const ficheMtIdsInModifiedAndRemoved = modifiedAndRemoved.map(
    (doc) => doc.pubId
  );

  const contributionsCdtnReferences = await getContributionsCdtnReferences(
    ficheMtIdsInModifiedAndRemoved
  );

  const contributionsRelevantDocCdtnReferences: DocumentInfoWithCdtnRef[] = [];
  contributionsCdtnReferences.forEach((item) => {
    item.cdtn_references.forEach((cdtnRef) => {
      const doc = modifiedAndRemoved.find(
        (node) => node.pubId === cdtnRef.document!.initial_id
      );
      if (doc) {
        contributionsRelevantDocCdtnReferences.push({
          ref: { id: doc.pubId, title: doc.title },
          id: item.id,
          title: item.question.content,
          slug: item.document?.slug ?? "",
          source: "contributions",
        });
      }
    });
  });
  return contributionsRelevantDocCdtnReferences;
}
