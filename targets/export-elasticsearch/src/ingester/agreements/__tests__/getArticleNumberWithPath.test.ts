import { getArticleNumberWithPath } from "../getAgreementsArticlesByTheme";

describe(`getArticleNumberWithPath`, () => {
  it.each([
    [
      "Texte de base » Titre IX. Salaires et classifications » Salaires » Article 35",
      "35",
    ],
    ["Texte de base » Titre X. Prévoyance", "non numéroté"],
    [
      "Texte de base » Titre VI. Durée et aménagement du temps de travail » Aménagement du temps de travail » Article 22",
      "22",
    ],
  ])("return the section linked to article", async (title, section) => {
    const received = await getArticleNumberWithPath(title);
    expect(received).toEqual(section);
  });
});
