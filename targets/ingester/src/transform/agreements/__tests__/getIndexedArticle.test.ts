import { readFileSync } from "fs";

import { loadArticles } from "../data-loaders";
import getIndexedArticle from "../getIndexedArticle";

describe(`libs/getIndexedArticle() should match properties`, () => {
  const data = readFileSync(
    "node_modules/@socialgouv/kali-data/data/articles/index.json"
  ).toString();
  const articles = JSON.parse(data);

  it(`with an existing article ID`, () => {
    expect(getIndexedArticle(articles, "KALIARTI000023306963")).toMatchObject({
      agreementId: "KALICONT000005635085",
      articleCid: "KALIARTI000005768420",
      articleId: "KALIARTI000023306963",
    });
  });

  it(`with an existing article CID`, () => {
    expect(getIndexedArticle(articles, "KALIARTI000005768420")).toMatchObject({
      agreementId: "KALICONT000005635085",
      articleCid: "KALIARTI000005768420",
      articleId: "KALIARTI000023306963",
    });
  });
});

describe(`should return undefined`, () => {
  it(`with a nonexistent article ID or CID`, async () => {
    const articles = await loadArticles();

    expect(getIndexedArticle(articles, "KALIARTI123456789012")).toBeUndefined();
  });
});
