import type { Agreement } from "@socialgouv/kali-data-types";

import { agreementArticlesWithPath } from "../agreement-articles-with-path";
import Articles from "./articles.json";
import KaliData from "./kali-data.json";

const loadAgreements = async (agreementId: string): Promise<Agreement> => {
  if (agreementId !== "KALICONT000005635097")
    throw new Error("unexpected argument");
  return Promise.resolve(KaliData as unknown as Agreement);
};

const loadArticles = async () => {
  return Promise.resolve(Articles);
};

describe(`agreementArticlesWithPath()`, () => {
  it(`with an existing agreement ID`, async () => {
    const received = await agreementArticlesWithPath(
      "KALICONT000005635097",
      loadAgreements,
      loadArticles
    );

    expect(received.length).toEqual(1);
    expect(received[0]?.path).toEqual([
      "Texte de base",
      "Titre Ier : Dispositions générales",
      "Article 1.1",
      "Champ d'application",
    ]);
  });
});
