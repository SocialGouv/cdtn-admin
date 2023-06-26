import { fetchRecentKaliReferences } from "../recentKaliReferences";

jest.mock("../fetchKaliReferences");

describe("fetchRecentKaliReferences", () => {
  it("should filter the result with the most recent", async () => {
    const result = await fetchRecentKaliReferences({
      agreementId: "0001",
      query: "%query%",
    });
    expect(result).toStrictEqual([
      {
        agreementId: "0001",
        id: "0002",
        cid: "0001",
        path: "path2",
        label: "label",
        createdAt: "2023-01-01T01:00:00.000000+00:00",
      },
    ]);
  });
});
