import { LinkedContent } from "@socialgouv/cdtn-types/build/elastic/related-items";
import { fetchLinkedContent } from "../common";
import {
  DocumentElasticWithSource,
  NewsTemplateDoc,
} from "@socialgouv/cdtn-types";

export const generateLinkedContent = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>
): Promise<LinkedContent[]> => {
  const linkedContentPromises = news.cdtnReferences.map(async (content) => {
    const linkedDocument = await fetchLinkedContent(
      content.cdtnId,
      `Actualité ${news.title}`
    );
    if (!linkedDocument) return;

    return {
      source: linkedDocument.source,
      slug: linkedDocument.slug,
      title: linkedDocument.title,
    };
  });
  const linkedContents = await Promise.all(linkedContentPromises);
  return linkedContents.filter((c): c is LinkedContent => !!c);
};
