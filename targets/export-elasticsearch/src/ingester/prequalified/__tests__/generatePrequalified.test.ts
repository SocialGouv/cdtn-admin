import { generatePrequalified } from "../generatePrequalified";

jest.mock("../fetchPrequalified", () => ({
  fetchPrequalified: () =>
    Promise.resolve([
      {
        id: "idPrequalified",
        title: "titlePrequalified",
        variants: ["prequalified1", "prequalified2"],
        documents: [
          {
            document: {
              id: "idInformation",
              cdtnId: "cdtnIdInformation",
              title: "titleInformation",
              slug: "slug-information",
              source: "information",
              text: "textInformation",
              isPublished: true,
              isSeachable: true,
              description: "descriptionInformation",
              document: {},
            },
          },
          {
            document: {
              id: "idContribution",
              cdtnId: "cdtnIdContribution",
              title: "titleContribution",
              slug: "slug-contribution",
              source: "contribution",
              text: "textContribution",
              isPublished: true,
              isSeachable: true,
              documentDescription: "descriptionContribution",
            },
          },
        ],
      },
    ]),
}));

describe("generatePrequalified", () => {
  it("should return prequalified", async () => {
    const result = await generatePrequalified(jest.fn());

    expect(result).toEqual([
      {
        breadcrumbs: [],
        cdtnId: "idPrequalified",
        excludeFromSearch: true,
        id: "idPrequalified",
        isPublished: true,
        metaDescription: "titlePrequalified",
        refs: [
          {
            cdtnId: "cdtnIdInformation",
            description: "descriptionInformation",
            id: "idInformation",
            slug: "slug-information",
            source: "information",
            title: "titleInformation",
          },
          {
            cdtnId: "cdtnIdContribution",
            description: "descriptionContribution",
            id: "idContribution",
            slug: "slug-contribution",
            source: "contribution",
            title: "titleContribution",
          },
        ],
        source: "prequalified",
        text: "titlePrequalified",
        title: "titlePrequalified",
        variants: ["prequalified1", "prequalified2"],
      },
    ]);
  });
});
