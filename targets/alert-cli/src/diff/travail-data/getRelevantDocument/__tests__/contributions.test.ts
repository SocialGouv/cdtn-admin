import { getRelevantMtDocumentsContributions } from "../contributions";

jest.mock("../../../shared/getContributionsCdtnReferences", () => ({
  getContributionsCdtnReferences: () =>
    Promise.resolve([
      {
        id: "c1",
        question: {
          id: "1",
          title: "Modified 1",
          content: "Nom question 1",
        },
        cdtn_references: [{ document: { initial_id: "pubId1" } }],
      },
      {
        id: "c2",
        question: {
          id: "2",
          title: "Modified 2",
          content: "Nom question 2",
        },
        cdtn_references: [{ document: { initial_id: "pubId3" } }],
      },
    ]),
}));

// Tests

describe("getRelevantMtDocumentsContributions", () => {
  it("should return empty array if no modified/removed docs", async () => {
    const result = await getRelevantMtDocumentsContributions({
      modified: [],
      removed: [],
    });
    expect(result).toEqual([]);
  });

  it("should only return contributions referencing modified/removed docs", async () => {
    // Mock data
    const modified: any = [{ pubId: "pubId1", title: "Modified 1" }];
    const removed: any = [{ pubId: "pubId2", title: "Removed 2" }];

    const expected = [
      {
        ref: { id: "pubId1", title: "Modified 1" },
        id: "c1",
        title: "Nom question 1",
        source: "contributions",
      },
    ];

    const result = await getRelevantMtDocumentsContributions({
      modified,
      removed,
    });
    expect(result).toEqual(expected);
  });
});
