import { generateFichesSpRef } from "../urlGenerator";

describe("url-generator", () => {
  test("generateFichesSpRef with audience camel case", () => {
    expect(generateFichesSpRef("associations", "article")).toEqual(
      "https://www.service-public.gouv.fr/associations/vosdroits/article"
    );
  });
});
