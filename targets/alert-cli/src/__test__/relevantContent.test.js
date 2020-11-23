import { describe, expect, it } from "@jest/globals";

import { getRelevantDocuments } from "../relevantContent";

jest.mock("../extractDilaReferences/ficheTravailEmploi", () => () => []);
jest.mock("../extractDilaReferences/contribution", () => () => [
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
  it("should return an array of document that match modified changes", async () => {
    const changes = {
      added: [],
      modified: [{ data: { cid: "c123", id: "123" }, type: "article" }],
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
    expect(await getRelevantDocuments(changes)).toEqual(expected);
  });
  it("should return an array of document that match deleted changes", async () => {
    const changes = {
      added: [],
      modified: [],
      removed: [{ data: { cid: "3", id: "3" }, type: "article" }],
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
    expect(await getRelevantDocuments(changes)).toEqual(expected);
  });
});
