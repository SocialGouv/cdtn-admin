import type {
  AgreementArticle,
  AgreementArticleWithPath,
} from "@socialgouv/kali-data";
import type { Agreement, IndexedArticle } from "@socialgouv/kali-data-types";
import flatFilter from "unist-util-flat-filter";

import { indexedArticle } from "./indexed-article";

/**
 * Get a flat unist array of all the articles an agreement contains.
 * Each article includes its parent sections path, as an ordered list of their titles.
 *
 */
export async function agreementArticlesWithPath(
  agreementIdOrIdcc: string,
  loadAgreement: (agreementId: string) => Promise<Agreement>,
  loadArticles: () => Promise<IndexedArticle[]>
): Promise<AgreementArticleWithPath[] | undefined[]> {
  const agreement = await loadAgreement(agreementIdOrIdcc);

  const rootedArticles = flatFilter(agreement as any, { type: "article" });

  if (!rootedArticles) {
    return [];
  }
  const articles = await loadArticles();

  return rootedArticles.children.map((article: AgreementArticle) => {
    const a = indexedArticle(articles, article.data.cid);
    if (!a) return;
    return {
      ...article,
      path: a.path,
    };
  });
}
