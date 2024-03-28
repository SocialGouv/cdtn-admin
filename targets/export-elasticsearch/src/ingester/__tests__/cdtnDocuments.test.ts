import { getIDCCs } from "../agreements/getIdcc";
import { getDuplicateSlugs } from "../cdtnDocuments";
import { context } from "../context";

jest.mock("@shared/utils");

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
      const contributions: any[] = [
        { idcc: "0292" },
        { idcc: "0829" },
        { idcc: "1557" },
        { idcc: "1909" },
      ];
      const idccs = await getIDCCs(contributions);
      expect(Array.from(idccs)).toEqual([292, 829, 1557, 1909]);
    });
  });
});
