import {
  DocumentElasticWithSource,
  NewsElasticDocument,
  NewsTemplateDoc,
} from "@socialgouv/cdtn-types";
import pMap from "p-map";
import { generateLinkedContent } from "./generateLinkedContent";
import { generateLinks } from "./generateLinks";

export const generateNews = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>[]
): Promise<NewsElasticDocument[]> => {
  return pMap(
    news,
    async (item): Promise<NewsElasticDocument> => {
      const linkedContent = await generateLinkedContent(item);
      const links = await generateLinks(item);
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
