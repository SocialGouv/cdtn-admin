import { getSection } from "../load-agreement-articles";

describe(`getSection`, () => {
  it.each([
    [
      [
        "Texte de base",
        "Titre IX. Salaires et classifications",
        "Salaires",
        "Article 35",
      ],
      "Salaires",
    ],
    [["Texte de base", "Titre X. Prévoyance"], "Titre X. Prévoyance"],
    [
      [
        "Texte de base",
        "Titre VI. Durée et aménagement du temps de travail",
        "Aménagement du temps de travail",
        "Article 22",
      ],
      "Aménagement du temps de travail",
    ],
  ])("return the section linked to article", async (title, section) => {
    const received = await getSection(title);
    expect(received).toEqual(section);
  });
});
