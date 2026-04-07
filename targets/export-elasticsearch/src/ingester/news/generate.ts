import {
  DocumentElasticWithSource,
  NewsElasticDocument,
  NewsTemplateDoc,
} from "@socialgouv/cdtn-types";
import pMap from "p-map";
import { generateLinkedContent } from "./generateLinkedContent";

export const generateNews = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>[]
): Promise<NewsElasticDocument[]> => {
  return pMap(
    news,
    async (item): Promise<NewsElasticDocument> => {
      const linkedContent = await generateLinkedContent(item);
      const { cdtnReferences, ...infographicWithoutRefs } = item;
      return {
        ...infographicWithoutRefs,
        source: "actualites",
        linkedContent,
      };
    },
    { concurrency: 5 }
  );
};
