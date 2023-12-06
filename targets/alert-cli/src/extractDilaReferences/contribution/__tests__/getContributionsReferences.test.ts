import { getContributionsReferences } from "../getContributionsReferences";

jest.mock("../queryContributionsReferences", () => ({
  queryContributionsReferences: jest.fn(() => [
    {
      id: "1",
      question: { content: "Sample question" },
      kali_references: [
        { kali_article: { cid: "123", id: "456", label: "Kali Article" } },
      ],
      legi_references: [
        { legi_article: { cid: "789", id: "012", label: "Legi Article" } },
      ],
    },
  ]),
}));

jest.mock("@shared/utils", () => ({
  generateKaliRef: jest.fn(() => "mockedKaliRef"),
  generateLegiRef: jest.fn(() => "mockedLegiRef"),
}));

describe("getContributionsReferences", () => {
  it("returns the expected references", async () => {
    const result = await getContributionsReferences();

    expect(result).toEqual([
      {
        document: {
          id: "1",
          source: "contributions",
          title: "Sample question",
        },
        references: [
          {
            dila_cid: "123",
            dila_container_id: "123",
            dila_id: "456",
            title: "Kali Article",
            url: "mockedKaliRef",
          },
          {
            dila_cid: "789",
            dila_container_id: "789",
            dila_id: "012",
            title: "Legi Article",
            url: "mockedLegiRef",
          },
        ],
      },
    ]);
  });
});
