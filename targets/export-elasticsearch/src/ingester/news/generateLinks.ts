import { fetchLinkedContent } from "../common";
import {
  DocumentElasticWithSource,
  NewsElasticLink,
  NewsTemplateDoc,
} from "@socialgouv/cdtn-types";

export const generateLinks = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>
): Promise<NewsElasticLink[]> => {
  const linkPromises = (news.links ?? []).map(
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
        ...(link.intro ? { intro: link.intro } : {}),
      };
    }
  );
  const generatedLinks = await Promise.all(linkPromises);
  return generatedLinks.filter((link): link is NewsElasticLink => !!link);
};
