import type { IndexedArticle } from "@socialgouv/kali-data";

const withArticleIdOrCid =
  (articleIdOrCid: string) =>
  (indexedArticle: IndexedArticle): boolean =>
    indexedArticle.articleId === articleIdOrCid ||
    indexedArticle.articleCid === articleIdOrCid;

export default function getIndexedArticle(
  articles: IndexedArticle[],
  articleIdOrCid: string
): IndexedArticle | undefined {
  return articles.find(withArticleIdOrCid(articleIdOrCid));
}
