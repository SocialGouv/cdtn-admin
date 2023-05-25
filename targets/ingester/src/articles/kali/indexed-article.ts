import type { IndexedArticle } from "@socialgouv/kali-data";

const withArticleIdOrCid =
  (articleIdOrCid: string) =>
  (article: IndexedArticle): boolean =>
    article.articleId === articleIdOrCid ||
    article.articleCid === articleIdOrCid;

export function indexedArticle(
  articles: IndexedArticle[],
  articleIdOrCid: string
): IndexedArticle | undefined {
  return articles.find(withArticleIdOrCid(articleIdOrCid));
}
