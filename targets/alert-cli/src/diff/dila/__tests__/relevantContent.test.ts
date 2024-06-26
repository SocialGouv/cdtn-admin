import { describe, expect, it } from "@jest/globals";
import type { DilaChanges } from "@socialgouv/cdtn-types";
import { RelevantDocumentsExtractorImpl } from "../RelevantDocuments";

jest.mock("../extractReferences/ficheTravailEmploi", () => () => []);
jest.mock("../extractReferences/mailTemplates", () => () => []);
jest.mock("../extractReferences/editorialContents", () => () => []);
jest.mock("../extractReferences/contribution", () => () => [
  {
    document: {
      id: "id-generic",
      source: "contributions",
      title: "question1",
    },
    references: [
      {
        category: "agreement",
        dila_cid: "c1",
        dila_container_id: "kalicont123",
        dila_id: "1",
        title: "Accord du 4 juin",
        url: "legifrance.url/kalicont123",
      },
      {
        category: "agreement",
        dila_cid: "3",
        dila_container_id: "kalicont42",
        dila_id: "3",
        title: "Accord du 3 novembre",
        url: "legifrance.url/kalicont42",
      },
    ],
  },
  {
    document: {
      id: "id-answer-123",
      source: "contributions",
      title: "question1",
    },
    references: [
      {
        category: "agreement",
        dila_cid: "c123",
        dila_container_id: "kalicont123",
        dila_id: "125",
        title: "accord c123",
        url: "url/c123",
      },
      {
        category: "agreement",
        dila_cid: "ext",
        dila_container_id: "kalicont123",
        dila_id: "ext125",
        title: "accord c125",
        url: "url/c125",
      },
      {
        category: "agreement",
        dila_cid: "4",
        dila_container_id: "kalicont42",
        dila_id: "4",
        title: "accord 42",
        url: "url/42",
      },
    ],
  },
]);

describe("getRelevantContent", () => {
  const extractor = new RelevantDocumentsExtractorImpl();
  it("should return an array of document that match modified changes", async () => {
    const changes: DilaChanges = {
      added: [],
      documents: [],
      modified: [
        {
          cid: "c123",
          diffs: [
            {
              currentText: "VIGUEUR",
              previousText: "VIGUEUR ETENDUE",
              type: "etat",
            },
          ],
          etat: "VIGUEYR",
          id: "123",
          parents: ["parents section"],
          title: "yolo",
        },
      ],
      removed: [],
    };
    const expected = [
      {
        document: {
          id: "id-answer-123",
          source: "contributions",
          title: "question1",
        },
        references: [
          {
            category: "agreement",
            dila_cid: "c123",
            dila_container_id: "kalicont123",
            dila_id: "125",
            title: "accord c123",
            url: "url/c123",
          },
        ],
      },
    ];
    expect(await extractor.extractReferences(changes)).toEqual(expected);
  });
  it("should return an array of document that match deleted changes", async () => {
    const changes = {
      added: [],
      modified: [],
      removed: [
        { cid: "3", id: "3", parents: ["section parent"], title: "test" },
      ],
    };
    const expected = [
      {
        document: {
          id: "id-generic",
          source: "contributions",
          title: "question1",
        },
        references: [
          {
            category: "agreement",
            dila_cid: "3",
            dila_container_id: "kalicont42",
            dila_id: "3",
            title: "Accord du 3 novembre",
            url: "legifrance.url/kalicont42",
          },
        ],
      },
    ];
    expect(await extractor.extractReferences(changes)).toEqual(expected);
  });
});
