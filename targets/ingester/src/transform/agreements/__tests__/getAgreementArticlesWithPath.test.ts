import getAgreementArticlesWithPath from "../getAgreementArticlesWithPath";

describe(`libs/getAgreementArticlesWithPath()`, () => {
  it(`with an existing agreement ID`, async () => {
    const received = await getAgreementArticlesWithPath("KALICONT000005635221");

    expect(received.length).toBeGreaterThan(3000);
    expect(received[0].path).toEqual([
      "Texte de base",
      "Titre Ier : Structures de la convention collective nationale",
      "Champ d'application",
      "Article 1-1",
    ]);
  });
});
