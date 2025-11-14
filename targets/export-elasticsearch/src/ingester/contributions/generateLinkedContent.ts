import { fetchLinkedContent } from "../common";
import { ContributionElasticDocumentLightRelatedContent } from "./generate";
import { isReferencingGenericContribution } from "./helpers";
import { LinkedContent } from "@socialgouv/cdtn-types/build/elastic/related-items";

export const generateLinkedContent = async (
  allGeneratedContributions: ContributionElasticDocumentLightRelatedContent[],
  currentContribution: ContributionElasticDocumentLightRelatedContent
): Promise<LinkedContent[]> => {
  const linkedContentPromises = currentContribution.linkedContent.map(
    async (content) => {
      const contributions = allGeneratedContributions.find(
        (item) => item.cdtnId === content.cdtnId
      );
      if (contributions) {
        return {
          source: contributions.source,
          slug: contributions.slug,
          title: contributions.title,
        };
      }
      const linkedDocument = await fetchLinkedContent(
        content.cdtnId,
        `QR${currentContribution.questionIndex} - IDCC ${currentContribution.idcc}`
      );
      if (!linkedDocument) return;

      return {
        source: linkedDocument.source,
        slug: linkedDocument.slug,
        title: linkedDocument.title,
      };
    }
  );
  const linkedContents = await Promise.all(linkedContentPromises);
  const exportFullLinkedContent = linkedContents.filter(
    (c): c is LinkedContent => !!c
  );
  if (isReferencingGenericContribution(currentContribution.contentType)) {
    const genericContribution = allGeneratedContributions.find(
      (item) =>
        item.questionIndex === currentContribution.questionIndex &&
        item.idcc === "0000"
    );
    if (!genericContribution) {
      throw new Error(
        `Aucune contribution générique a été retrouvée pour la question ${currentContribution.questionIndex}`
      );
    }
    if (genericContribution.type === "generic-no-cdt") {
      throw new Error(
        `La contribution [${currentContribution.questionIndex} - ${currentContribution.idcc}] ne peut pas référencer une générique qui n'a pas de réponse`
      );
    }
    const genericLinkedContent = await generateLinkedContent(
      allGeneratedContributions,
      genericContribution
    );
    const result = [...exportFullLinkedContent, ...genericLinkedContent];
    return removeDuplicates(result);
  }
  return exportFullLinkedContent;
};

const removeDuplicates = (array: LinkedContent[]) => {
  return array.filter(
    (v, i) => array.findIndex((v2) => v2.slug === v.slug) === i
  );
};
