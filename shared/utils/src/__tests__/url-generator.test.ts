import { generateFichesSpRef } from "../url-generator";

describe("url-generator", () => {
  test("generateFichesSpRef with audience camel case", () => {
    expect(generateFichesSpRef("Associations", "article")).toEqual("https://www.service-public.fr/associations/vosdroits/article");
  });
  test("generateFichesSpRef with audience lower case", () => {
    expect(generateFichesSpRef("Associations", "article")).toEqual("https://www.service-public.fr/associations/vosdroits/article");
  });
});
