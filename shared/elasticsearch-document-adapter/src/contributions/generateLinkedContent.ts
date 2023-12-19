import { GetBreadcrumbsFn } from "../breadcrumbs";
import { fetchLinkedContent } from "./fetchLinkedContent";
import {
  Breadcrumbs,
  ContributionLinkedContent,
  ExportFullLinkedContent,
} from "@shared/types";
import { ContributionElasticDocumentLightRelatedContent } from "./generate";

export const generateLinkedContent = async (
  allGeneratedContributions: ContributionElasticDocumentLightRelatedContent[],
  questionIndex: number,
  idcc: string,
  linkedContent: ContributionLinkedContent[],
  getBreadcrumbs: GetBreadcrumbsFn,
  breadcrumbsOfRootContributionsPerIndex: Record<number, Breadcrumbs[]>
): Promise<ExportFullLinkedContent[]> => {
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
    const linkedDocument = await fetchLinkedContent(
      content.cdtnId,
      questionIndex,
      idcc
    );
    if (!linkedDocument) return;
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
  return (await Promise.all(linkedContentPromises).then((contents) =>
    contents.filter((c) => c)
  )) as ExportFullLinkedContent[];
};
