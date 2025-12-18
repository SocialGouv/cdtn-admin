import { getRelevantSpDocumentsContributions } from "../contributions";

jest.mock("../../getContributionsWithFicheSp", () => ({
  getContributionsWithFicheSp: () =>
    Promise.resolve([
      {
        id: "c1",
        question: {
          id: "1",
          title: "Modified 1",
          content: "Nom question 1",
        },
        document: {
          slug: "slug1",
        },
        content_fiche_sp: { initial_id: "pubId1", document: { url: "url1" } },
      },
      {
        id: "c2",
        question: {
          id: "2",
          title: "Modified 2",
          content: "Nom question 2",
        },
        document: {
          slug: "slug2",
        },
        content_fiche_sp: { initial_id: "pubId3", document: { url: "url3" } },
      },
    ]),
}));

jest.mock("../../../shared/getContributionsCdtnReferences", () => ({
  getContributionsCdtnReferences: () =>
    Promise.resolve([
      {
        id: "c3",
        question: {
          id: "3",
          title: "Modified 3",
          content: "Nom question 3",
        },
        cdtn_references: [{ document: { initial_id: "pubId2" } }],
        document: {
          slug: "slug3",
        },
      },
    ]),
}));

// Tests

describe("getRelevantSpDocumentsContributions", () => {
  it("should return empty array if no modified/removed docs", async () => {
    const result = await getRelevantSpDocumentsContributions({
      modified: [],
      removed: [],
    });
    expect(result).toEqual([]);
  });

  it("should only return contributions referencing modified/removed docs", async () => {
    // Mock data
    const modified: any = [{ id: "pubId1", title: "Modified 1" }];
    const removed: any = [{ id: "pubId2", title: "Removed 2" }];

    const expected = [
      {
        ref: { id: "pubId1", title: "Modified 1" },
        id: "c1",
        title: "Nom question 1",
        slug: "slug1",
        source: "contributions",
        url: "url1",
      },
      {
        ref: { id: "pubId2", title: "Removed 2" },
        id: "c3",
        title: "Nom question 3",
        slug: "slug3",
        source: "contributions",
      },
    ];

    const result = await getRelevantSpDocumentsContributions({
      modified,
      removed,
    });
    expect(result).toEqual(expected);
  });
});
