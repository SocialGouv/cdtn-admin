import { mapAgreementToDocument } from "../mapAgreementToDocument";
import { Agreement } from "../type";

jest.mock("../../common/getGlossaryContent.ts", () => {
  return {
    getGlossaryContent: jest.fn(() => "mocked-glossary-content"),
  };
});

describe("mapAgreementToDocument", () => {
  const agreement: Agreement = {
    id: "1234",
    isSupported: false,
    name: "Ma nouvelle CC du 03 Octobre 2024",
    shortName: "Ma nouvelle CC",
    synonyms: [],
    updatedAt: "3/10/2024",
  };

  it("crée un nouveau document si pas de doc", async () => {
    const result = await mapAgreementToDocument(agreement);
    expect(result).toEqual({
      cdtn_id: "6f8c4cc14e",
      document: {
        num: 1234,
        shortTitle: "Ma nouvelle CC",
        synonymes: [],
      },
      initial_id: "1234",
      is_available: true,
      is_published: false,
      is_searchable: false,
      meta_description: "IDCC 1234: Ma nouvelle CC du 03 Octobre 2024",
      slug: "1234-ma-nouvelle-cc",
      source: "conventions_collectives",
      text: "IDCC 1234: Ma nouvelle CC du 03 Octobre 2024 Ma nouvelle CC",
      title: "Ma nouvelle CC du 03 Octobre 2024",
    });
  });
});
