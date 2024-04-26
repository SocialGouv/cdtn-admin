import type {
  DocumentInfoWithCdtnRef,
  VddChanges,
} from "@socialgouv/cdtn-types";

import { getContributionsWithFicheSp } from "./../getContributionsWithFicheSp";
import { getContributionsCdtnReferences } from "../../shared/getContributionsCdtnReferences";

export async function getRelevantSpDocumentsContributions({
  modified,
  removed,
}: Pick<VddChanges, "modified" | "removed">): Promise<
  DocumentInfoWithCdtnRef[]
> {
  const modifiedAndRemoved = [...modified, ...removed];

  const ficheSpIdsInModifiedAndRemoved = modifiedAndRemoved.map(
    (doc) => doc.id
  );
  const contributionsGenericUsingSp = await getContributionsWithFicheSp(
    ficheSpIdsInModifiedAndRemoved
  );
  const contributionsRelevantDocGenericUsingSp =
    contributionsGenericUsingSp.flatMap((item) => {
      if (!item.content_fiche_sp) {
        return [];
      }
      const doc = modifiedAndRemoved.find(
        (node) => node.id === item.content_fiche_sp!.initial_id
      );
      if (!doc) {
        return [];
      }
      const res: DocumentInfoWithCdtnRef = {
        ref: { id: doc.id, title: doc.title },
        id: item.id,
        title: item.question.content,
        source: "contributions",
        url: item.content_fiche_sp.document.url,
      };
      return [res];
    });

  const contributionsCdtnReferences = await getContributionsCdtnReferences(
    ficheSpIdsInModifiedAndRemoved
  );
  const contributionsRelevantDocCdtnReferences: DocumentInfoWithCdtnRef[] = [];
  contributionsCdtnReferences.forEach((item) => {
    item.cdtn_references.forEach((cdtnRef) => {
      const doc = modifiedAndRemoved.find(
        (node) => node.id === cdtnRef.document!.initial_id
      );
      if (doc) {
        contributionsRelevantDocCdtnReferences.push({
          ref: { id: doc.id, title: doc.title },
          id: item.id,
          title: item.question.content,
          source: "contributions",
        });
      }
    });
  });

  return [
    ...contributionsRelevantDocGenericUsingSp,
    ...contributionsRelevantDocCdtnReferences,
  ];
}
