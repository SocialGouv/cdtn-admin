import { generateAgreements } from "../index";
import { CCN, contribs } from "../../__fixtures__/data";

jest.mock("@shared/utils");
jest.mock("../getAgreementsArticlesByTheme");

describe("generateAgreements", () => {
  it("should map and group contributions", async () => {
    // @ts-ignore
    const pagesCCs = await generateAgreements(CCN, contribs);

    expect(pagesCCs.length).toEqual(2);
    expect(pagesCCs[0].slug).toEqual(
      "1875-veterinaires-personnel-salarie-des-cabinets-et-cliniques-veterinaires"
    );
    expect(pagesCCs[0].answers.length).toEqual(0);

    expect(pagesCCs[1].slug).toEqual(
      "5571-convention-dentreprise-fondation-dauteuil"
    );
    expect(pagesCCs[1].answers).toEqual([
      {
        answers: [
          {
            questionIndex: 44,
            slug: "1486-quelle-est-la-duree-du-conge-de-maternite",
            theme: "Congés et repos",
            title: "Quelle est la durée du congé de maternité ?",
          },
        ],
        theme: "Congés et repos",
      },
      {
        answers: [
          {
            questionIndex: 47,
            slug: "1351-en-cas-de-maladie-le-salarie-a-t-il-droit-a-une-garantie-demploi",
            theme: "Santé, sécurité et conditions de travail",
            title:
              "En cas de maladie, le salarié a-t-il droit à une garantie d’emploi ?",
          },
        ],
        theme: "Santé, sécurité et conditions de travail",
      },
    ]);
  });
});
