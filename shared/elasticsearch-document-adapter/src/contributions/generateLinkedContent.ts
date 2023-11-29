import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { ContributionLinkedContent } from "./types";
import { Breadcrumbs, GetBreadcrumbsFn } from "../breadcrumbs";
import { fetchLinkedContent } from "./fetchLinkedContent";

export const generateLinkedContent = async (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  getBreadcrumbs: GetBreadcrumbsFn,
  breadcrumbsOfRootContributionsPerIndex: Record<number, Breadcrumbs[]>
): Promise<ContributionLinkedContent> => {
  const linkedContentPromises = contribution.linkedContent.map(
    async (content) => {
      const linkedDocument = await fetchLinkedContent(content.cdtnId);
      let breadcrumbs = getBreadcrumbs(content.cdtnId);
      if (
        linkedDocument.source === "contributions" &&
        breadcrumbs.length === 0
      ) {
        breadcrumbs =
          breadcrumbsOfRootContributionsPerIndex[contribution.questionIndex];
      }
      return {
        breadcrumbs,
        description: linkedDocument.text,
        source: linkedDocument.source,
        slug: linkedDocument.slug,
        title: linkedDocument.title,
      };
    }
  );
  const linkedContent = await Promise.all(linkedContentPromises);
  return { linkedContent };
};
