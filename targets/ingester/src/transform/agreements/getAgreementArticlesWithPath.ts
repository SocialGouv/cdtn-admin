import type {
  AgreementArticle,
  AgreementArticleWithPath,
} from "@socialgouv/kali-data";
import flatFilter from "unist-util-flat-filter";

import { loadAgreement, loadArticles } from "./data-loaders";
import getIndexedArticle from "./getIndexedArticle";

/**
 * Get a flat unist array of all the articles an agreement contains.
 * Each article includes its parent sections path, as an ordered list of their titles.
 *
 */
export default async function getAgreementArticlesWithPath(
  agreementIdOrIdcc: string
): Promise<AgreementArticleWithPath[] | undefined[]> {
  const agreement = await loadAgreement(agreementIdOrIdcc);

  const rootedArticles = flatFilter(agreement as any, { type: "article" });

  if (!rootedArticles) {
    return [];
  }
  const articles = await loadArticles();

  return rootedArticles.children.map((article: AgreementArticle) => {
    const a = getIndexedArticle(articles, article.data.cid);
    if (!a) return;
    return {
      ...article,
      path: a.path,
    };
  });
}
