import { loadArticles } from "../../agreements/data-loaders";
import getIndexedArticle from "../getIndexedArticle";

describe(`libs/getIndexedArticle()`, () => {
  describe(`should match properties`, () => {
    it(`with an existing article ID`, async () => {
      const articles = await loadArticles();

      expect(getIndexedArticle(articles, "KALIARTI000023306963")).toMatchObject(
        {
          agreementId: "KALICONT000005635085",
          articleCid: "KALIARTI000005768420",
          articleId: "KALIARTI000023306963",
        }
      );
    });

    it(`with an existing article CID`, async () => {
      const articles = await loadArticles();

      expect(getIndexedArticle(articles, "KALIARTI000005768420")).toMatchObject(
        {
          agreementId: "KALICONT000005635085",
          articleCid: "KALIARTI000005768420",
          articleId: "KALIARTI000023306963",
        }
      );
    });
  });

  describe(`should return undefined`, () => {
    it(`with a nonexistent article ID or CID`, async () => {
      const articles = await loadArticles();

      expect(
        getIndexedArticle(articles, "KALIARTI123456789012")
      ).toBeUndefined();
    });
  });
});
