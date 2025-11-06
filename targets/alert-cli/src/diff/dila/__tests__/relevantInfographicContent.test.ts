import { describe, expect, it } from "@jest/globals";
import type { DilaChanges } from "@socialgouv/cdtn-types";
import { RelevantDocumentsExtractorImpl } from "../RelevantDocuments";
import { SOURCES } from "@socialgouv/cdtn-utils";

const info1 = {
  document: {
    id: "id-infographic-1",
    source: SOURCES.INFOGRAPHICS,
    title: "Titre infographic 1",
    slug: "titre-infographic 1"
  },
  references: [
    {
      dila_cid: "cid1",
      dila_container_id: "KALICONT1",
      dila_id: "1",
      title: "Titre dila 1",
      url: "legifrance.url/kalicont1/cid1"
    },
    {
      dila_cid: "cid2",
      dila_container_id: "KALICONT2",
      dila_id: "2",
      title: "Titre dila 2",
      url: "legifrance.url/kalicont1/cid2"
    }
  ]
};

const info2 = {
  document: {
    id: "id-infographic-2",
    source: SOURCES.INFOGRAPHICS,
    title: "Titre infographic 2",
    slug: "titre-infographic 2"
  },
  references: [
    {
      dila_cid: "cid1",
      dila_container_id: "KALICONT1",
      dila_id: "1",
      title: "Titre dila 1",
      url: "legifrance.url/kalicont1/cid1"
    },
    {
      dila_cid: "cid3",
      dila_container_id: "KALICONT3",
      dila_id: "3",
      title: "Titre dila 3",
      url: "legifrance.url/kalicont1/cid3"
    }
  ]
};

jest.mock("../extractReferences/ficheTravailEmploi", () => () => []);
jest.mock("../extractReferences/mailTemplates", () => () => []);
jest.mock("../extractReferences/editorialContents", () => () => []);
jest.mock("../extractReferences/simulators", () => () => []);
jest.mock("../extractReferences/contribution", () => () => []);
jest.mock("../extractReferences/infographics", () => () => [info1, info2]);

describe("getRelevantContent", () => {
  const extractor = new RelevantDocumentsExtractorImpl();
  it("should return an array of document that match modified changes", async () => {
    const changes: DilaChanges = {
      added: [],
      documents: [],
      modified: [
        {
          cid: "cid2",
          diffs: [
            {
              currentText: "VIGUEUR",
              previousText: "VIGUEUR ETENDUE",
              type: "etat"
            }
          ],
          etat: "VIGUEYR",
          id: "123",
          parents: ["parents section"],
          title: "yolo"
        }
      ],
      removed: []
    };
    expect(await extractor.extractReferences(changes)).toEqual([
      {
        document: {
          id: "id-infographic-1",
          source: SOURCES.INFOGRAPHICS,
          title: "Titre infographic 1",
          slug: "titre-infographic 1"
        },
        references: [
          {
            dila_cid: "cid2",
            dila_container_id: "KALICONT2",
            dila_id: "2",
            title: "Titre dila 2",
            url: "legifrance.url/kalicont1/cid2"
          }
        ]
      }
    ]);
  });

  it("should return an array of document that match deleted changes", async () => {
    const changes = {
      added: [],
      modified: [],
      removed: [
        { cid: "cid2", id: "2", parents: ["section parent"], title: "test" }
      ]
    };
    expect(await extractor.extractReferences(changes)).toEqual([
      {
        document: {
          id: "id-infographic-1",
          source: SOURCES.INFOGRAPHICS,
          title: "Titre infographic 1",
          slug: "titre-infographic 1"
        },
        references: [
          {
            dila_cid: "cid2",
            dila_container_id: "KALICONT2",
            dila_id: "2",
            title: "Titre dila 2",
            url: "legifrance.url/kalicont1/cid2"
          }
        ]
      }
    ]);
  });
});
