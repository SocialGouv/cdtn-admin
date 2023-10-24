import {
  getContributionAnswers,
  getContributionsWithSlug,
} from "../agreements";

jest.mock("../../lib/fetchContributions/ContributionRepository");
jest.mock("../../lib/fetchContributions/AgreementRepository");

describe("getContributionAnswers", () => {
  test("one answer with type NOTHING", async () => {
    const contributionsWithSlug = await getContributionsWithSlug();
    const result = getContributionAnswers(contributionsWithSlug, 44);
    expect(result).toEqual([
      {
        contentType: "NOTHING",
        order: 52,
        question: "Jours fériés et ponts dans le secteur privé",
        references: [
          {
            title:
              "Avenant n°1 Ouvriers et collaborateurs du 11 février 1971 , article 17",
            url: "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005846379/?idConteneur=KALICONT000005635613",
          },
          {
            title:
              "Avenant n°1 Ouvriers et collaborateurs du 11 février 1971 Article 19",
            url: "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005846381/?idConteneur=KALICONT000005635613",
          },
          {
            title: "Cass. Soc. 30 novembre 2004 n° 02-45.785",
            url: "https://www.legifrance.gouv.fr/juri/id/JURITEXT000007052459?page=1&pageSize=10&query=02-45.785&searchField=ALL&searchType=ALL&sortValue=DATE_DESC&tab_selection=juri&typePagination=DEFAULT",
          },
        ],
        genericSlug: "jours-feries-et-ponts-dans-le-secteur-prive",
      },
    ]);
  });

  test("one answer with type ANSWER", async () => {
    const contributionsWithSlug = await getContributionsWithSlug();
    const result = getContributionAnswers(contributionsWithSlug, 16);
    expect(result[0].content).toEqual(
      "<p>ceci est ma réponse pour la CC 0016</p>"
    );
    expect(result[0].contentType).toEqual("ANSWER");
    expect(result[0].genericSlug).toEqual(
      "jours-feries-et-ponts-dans-le-secteur-prive"
    );
  });
});
