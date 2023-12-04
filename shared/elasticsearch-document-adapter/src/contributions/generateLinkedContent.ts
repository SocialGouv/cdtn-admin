import { ContributionFullLinkedContent } from "./types";
import { Breadcrumbs, GetBreadcrumbsFn } from "../breadcrumbs";
import { fetchLinkedContent } from "./fetchLinkedContent";
import { ContributionLinkedContent } from "@shared/types";
import { ContributionElasticDocumentLightRelatedContent } from "./generate";

export const generateLinkedContent = async (
  allGeneratedContributions: ContributionElasticDocumentLightRelatedContent[],
  questionIndex: number,
  linkedContent: ContributionLinkedContent[],
  getBreadcrumbs: GetBreadcrumbsFn,
  breadcrumbsOfRootContributionsPerIndex: Record<number, Breadcrumbs[]>
): Promise<ContributionFullLinkedContent> => {
  const linkedContentPromises = linkedContent.map(async (content) => {
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
    const linkedDocument = await fetchLinkedContent(content.cdtnId);
    let breadcrumbs = getBreadcrumbs(content.cdtnId);
    if (linkedDocument.source === "contributions" && breadcrumbs.length === 0) {
      breadcrumbs = breadcrumbsOfRootContributionsPerIndex[questionIndex];
    }
    return {
      breadcrumbs,
      description: linkedDocument.description ?? "",
      source: linkedDocument.source,
      slug: linkedDocument.slug,
      title: linkedDocument.title,
    };
  });
  const linkedContents = await Promise.all(linkedContentPromises);
  return { linkedContent: linkedContents };
};
