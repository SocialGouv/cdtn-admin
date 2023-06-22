import type { Agreement } from "@socialgouv/kali-data-types";

import { loadAgreementArticles } from "../load-agreement-articles";
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
test("Load articles of an agreement", async () => {
  const result = await loadAgreementArticles(
    "KALICONT000005635097",
    "2075",
    loadAgreements,
    loadArticles
  );
  expect(result).toEqual([
    {
      agreement_id: "2075",
      cid: "KALIARTI000005854517",
      id: "KALIARTI000005854517",
      path: "Texte de base » Titre Ier : Dispositions générales » Article 1.1 » Champ d'application",
      label: "Champ d'application",
    },
  ]);
});
