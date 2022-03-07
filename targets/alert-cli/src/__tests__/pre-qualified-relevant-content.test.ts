import { describe, expect, it } from "@jest/globals";

import { _getDocumentsWithRelations } from "../diff/pre-qualified-relevant-content";

jest.mock("../extractDilaReferences/getAllDocumentsBySource", () => ({
  getDocumentsWithRelationsBySource: async () =>
    Promise.resolve([
      {
        cdtnId: "1",
        title: "Handicap",
        source: "themes",
        contentRelations: [
          {
            document: {
              initialId: "F2839",
            },
          },
        ],
      },
      {
        cdtnId: "2",
        title: "procédure licenciement pour inaptitude",
        source: "prequalified",
        contentRelations: [
          {
            document: {
              initialId: "F2839",
            },
          },
          {
            document: {
              initialId: "LEGIARTI000033013440",
            },
          },
        ],
      },
      {
        cdtnId: "3",
        title: "complement-salaire pole emploi",
        source: "prequalified",
        contentRelations: [
          {
            document: {
              initialId: "F2839",
            },
          },
        ],
      },
    ]),
}));

describe("_getDocumentsWithRelations", () => {
  it("should return a list of documents which are in relation with a prequalified or a themes", async () => {
    const result = await _getDocumentsWithRelations();
    expect(result.size).toEqual(2);
    expect(result.get("F2839")).toEqual([
      {
        id: "1",
        source: "themes",
        title: "Handicap",
      },
      {
        id: "2",
        source: "prequalified",
        title: "procédure licenciement pour inaptitude",
      },
      {
        id: "3",
        source: "prequalified",
        title: "complement-salaire pole emploi",
      },
    ]);
    expect(result.get("LEGIARTI000033013440")).toEqual([
      {
        id: "2",
        source: "prequalified",
        title: "procédure licenciement pour inaptitude",
      },
    ]);
  });
});
