import { getContributionsReferences } from "../getContributionsReferences";

jest.mock("../queryContributionsReferences", () => ({
  queryContributionsReferences: jest.fn(() => [
    {
      id: "1",
      question: { content: "Sample question" },
      document: { slug: "slug1" },
      kali_references: [
        { kali_article: { cid: "123", id: "456", label: "Kali Article" } },
      ],
      legi_references: [
        { legi_article: { cid: "789", id: "012", label: "Legi Article" } },
      ],
      agreement: {
        kali_id: "agreement_kali_id",
      },
    },
  ]),
}));

jest.mock("@shared/utils", () => ({
  generateKaliRef: jest.fn(() => "mockedKaliRef"),
  generateLegiRef: jest.fn(() => "mockedLegiRef"),
  LEGI_CONTAINER_ID: "LEGI_CONTAINER_ID_MOCKED",
}));

describe("getContributionsReferences", () => {
  it("returns the expected references", async () => {
    const result = await getContributionsReferences();

    expect(result).toEqual([
      {
        document: {
          id: "1",
          slug: "slug1",
          source: "contributions",
          title: "Sample question",
        },
        references: [
          {
            dila_cid: "123",
            dila_container_id: "agreement_kali_id",
            dila_id: "456",
            title: "Kali Article",
            url: "mockedKaliRef",
          },
          {
            dila_cid: "789",
            dila_container_id: "LEGI_CONTAINER_ID_MOCKED",
            dila_id: "012",
            title: "Legi Article",
            url: "mockedLegiRef",
          },
        ],
      },
    ]);
  });
});
