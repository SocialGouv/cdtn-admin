import { loadArticles } from "../../../lib/data-loaders";
import { indexedArticle } from "../indexed-article";
import Articles from "./articles.json";

describe(`libs/getIndexedArticle() should match properties`, () => {
  const articles = Articles;

  it(`with an existing article ID`, () => {
    expect(indexedArticle(articles, "KALIARTI000023306963")).toMatchObject({
      agreementId: "KALICONT000005635085",
      articleCid: "KALIARTI000005768420",
      articleId: "KALIARTI000023306963",
    });
  });

  it(`with an existing article CID`, () => {
    expect(indexedArticle(articles, "KALIARTI000005768420")).toMatchObject({
      agreementId: "KALICONT000005635085",
      articleCid: "KALIARTI000005768420",
      articleId: "KALIARTI000023306963",
    });
  });
});

describe(`should return undefined`, () => {
  it(`with a nonexistent article ID or CID`, async () => {
    const articles = await loadArticles();

    expect(indexedArticle(articles, "KALIARTI123456789012")).toBeUndefined();
  });
});
