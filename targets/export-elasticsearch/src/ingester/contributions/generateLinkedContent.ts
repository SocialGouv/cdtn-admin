import { GetBreadcrumbsFn } from "../breadcrumbs";
import { fetchLinkedContent } from "./fetchLinkedContent";
import { Breadcrumbs, ExportFullLinkedContent } from "@shared/types";
import { ContributionElasticDocumentLightRelatedContent } from "./generate";
import { isReferencingGenericContribution } from "./helpers";

export const generateLinkedContent = async (
  allGeneratedContributions: ContributionElasticDocumentLightRelatedContent[],
  currentContribution: ContributionElasticDocumentLightRelatedContent,
  getBreadcrumbs: GetBreadcrumbsFn,
  breadcrumbsOfRootContributionsPerIndex: Record<number, Breadcrumbs[]>
): Promise<ExportFullLinkedContent[]> => {
  const linkedContentPromises = currentContribution.linkedContent.map(
    async (content) => {
      const contributions = allGeneratedContributions.find(
        (item) => item.cdtnId === content.cdtnId
      );
      if (contributions) {
        return {
          breadcrumbs: contributions.breadcrumbs,
          description: contributions.description,
          source: contributions.source,
          slug: contributions.slug,
          title: contributions.title,
        };
      }
      const linkedDocument = await fetchLinkedContent(
        content.cdtnId,
        currentContribution.questionIndex,
        currentContribution.idcc
      );
      if (!linkedDocument) return;
      let breadcrumbs = getBreadcrumbs(content.cdtnId);
      if (
        linkedDocument.source === "contributions" &&
        breadcrumbs.length === 0
      ) {
        breadcrumbs =
          breadcrumbsOfRootContributionsPerIndex[
            currentContribution.questionIndex
          ];
      }
      return {
        breadcrumbs,
        description: linkedDocument.description ?? "",
        source: linkedDocument.source,
        slug: linkedDocument.slug,
        title: linkedDocument.title,
      };
    }
  );
  const linkedContents = await Promise.all(linkedContentPromises);
  const exportFullLinkedContent = linkedContents.filter(
    (c): c is ExportFullLinkedContent => !!c
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
      genericContribution,
      getBreadcrumbs,
      breadcrumbsOfRootContributionsPerIndex
    );
    const result = [...exportFullLinkedContent, ...genericLinkedContent];
    return removeDuplicates(result);
  }
  return exportFullLinkedContent;
};

const removeDuplicates = (array: ExportFullLinkedContent[]) => {
  return array.filter(
    (v, i) => array.findIndex((v2) => v2.slug === v.slug) === i
  );
};
