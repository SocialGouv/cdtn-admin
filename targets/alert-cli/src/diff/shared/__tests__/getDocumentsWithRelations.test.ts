import { describe, expect, it } from "@jest/globals";

import { getDocumentsWithRelations } from "../getDocumentsWithRelations";
import { SOURCES } from "@socialgouv/cdtn-utils";

jest.mock("../createDocumentsFetcher", () => ({
  createDocumentsFetcher: () => async () =>
    Promise.resolve([
      {
        status: "fulfilled",
        value: {
          data: {
            documents: [
              {
                cdtnId: "1",
                isPublished: true,
                contentRelations: [
                  {
                    position: 1,
                    document: {
                      initialId: "F2839",
                      slug: "slug1",
                      source: "contributions",
                      title: "contribution1",
                    },
                  },
                ],
                source: "themes",
                title: "Handicap",
              },
            ],
          },
        },
      },
    ]),
}));

jest.mock("../fetchPrequalified", () => ({
  fetchPrequalified: async () =>
    Promise.resolve([
      {
        cdtnId: "2",
        isPublished: true,
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
        title: "procédure licenciement pour inaptitude",
      },
      {
        cdtnId: "3",
        isPublished: true,
        source: "prequalified",
        contentRelations: [
          {
            document: {
              initialId: "F2839",
            },
          },
        ],
        title: "complement-salaire pole emploi",
      },
    ]),
}));

describe("getDocumentsWithRelations", () => {
  it("should return a list of documents which are in relation with a prequalified or a themes", async () => {
    const result = await getDocumentsWithRelations([
      SOURCES.PREQUALIFIED,
      SOURCES.THEMES,
    ]);
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
