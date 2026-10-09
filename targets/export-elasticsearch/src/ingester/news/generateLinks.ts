import { fetchLinkedContent } from "../common";
import {
  DocumentElasticWithSource,
  NewsElasticLink,
  NewsTemplateDoc,
  NewsTemplateLink,
} from "@socialgouv/cdtn-types";

export const generateLinks = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>
): Promise<NewsElasticLink[]> => {
  const links: NewsTemplateLink[] =
    news.links ??
    news.cdtnReferences.map((ref) => ({
      type: "cdtn" as const,
      cdtnId: ref.cdtnId,
    }));
  const linkPromises = links.map(
    async (link): Promise<NewsElasticLink | undefined> => {
      if (link.type === "external") return link;
      const linkedDocument = await fetchLinkedContent(
        link.cdtnId,
        `Actualité ${news.title}`
      );
      if (!linkedDocument) return;

      return {
        type: "cdtn",
        source: linkedDocument.source,
        slug: linkedDocument.slug,
        title: linkedDocument.title,
      };
    }
  );
  const generatedLinks = await Promise.all(linkPromises);
  return generatedLinks.filter((link): link is NewsElasticLink => !!link);
};
