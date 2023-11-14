import { getDuplicateSlugs, getIDCCs } from "../cdtnDocuments";
import { context } from "../context";

jest.mock("@socialgouv/cdtn-logger");

describe("cdtnDocuments", () => {
  describe("getDuplicateSlug", () => {
    test("should return an empty array if there is no duplicate slug", async () => {
      context.provide();
      const documents = [
        [
          { slug: "slug-1", source: "cdt" },
          { slug: "slug-2", source: "cdt" },
        ],
        [
          { slug: "slug-1", source: "contribution" },
          { slug: "slug-2", source: "contribution" },
        ],
      ];
      const duplicateSlugs = await getDuplicateSlugs(documents);
      expect(Object.entries(duplicateSlugs).length).toBe(0);
    });

    test("should return an array of duplicated slug", async () => {
      context.provide();
      const documents = [
        [
          { slug: "slug-1", source: "cdt" },
          { slug: "slug-2", source: "cdt" },
        ],
        [
          { slug: "slug-1", source: "faq" },
          { slug: "slug-1", source: "faq" },
        ],
        [
          { slug: "slug-4", source: "fiche" },
          { slug: "slug-3", source: "fiche" },
        ],
      ];
      const duplicateSlugs = await getDuplicateSlugs(documents);
      expect(Object.entries(duplicateSlugs).length).toBe(1);
    });
  });

  describe("updateContributionsAndGetIDCCs", () => {
    test("should return a list of iddc", async () => {
      const ccnData = [
        {
          num: 829,
          slug: "829-convention-collective-departementale-des-industries-metallurgiques-et-des-in",
        },
        {
          num: 292,
          slug: "292-plasturgie",
        },
        {
          num: 1557,
          slug: "1557-commerce-des-articles-de-sport-et-equipements-de-loisirs",
        },
        {
          num: 1909,
          slug: "1909-organismes-de-tourisme",
        },
      ];

      const contributions: any[] = [
        { answers: { conventionAnswer: { idcc: "0292" } } },
        { answers: { conventionAnswer: { idcc: "0829" } } },
        { answers: { conventionAnswer: { idcc: "1557" } } },
        { answers: { conventionAnswer: { idcc: "1909" } } },
      ];
      const idccs = await getIDCCs(contributions, []);
      expect(Array.from(idccs)).toEqual([292, 829, 1557, 1909]);
    });
  });
});
