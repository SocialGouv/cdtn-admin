import {
  DocumentElasticWithSource,
  NewsElasticDocument,
  NewsTemplateDoc,
} from "@socialgouv/cdtn-types";
import pMap from "p-map";
import { generateLinks } from "./generateLinks";

export const generateNews = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>[]
): Promise<NewsElasticDocument[]> => {
  return pMap(
    news,
    async (item): Promise<NewsElasticDocument> => {
      const links = await generateLinks(item);
      const linkedContent = links.flatMap((link) =>
        link.type === "cdtn"
          ? [{ source: link.source, slug: link.slug, title: link.title }]
          : []
      );
      const { cdtnReferences, links: _links, references, ...rest } = item;
      return {
        ...rest,
        source: "actualites",
        linkedContent,
        links,
        references: references ?? [],
      };
    },
    { concurrency: 5 }
  );
};
