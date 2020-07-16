import { describe, expect, it, jest } from "@jest/globals";

import { getRelevantDocuments } from "../relevantContent";

jest.mock("@socialgouv/contributions-data/data/contributions.json", () => [
  {
    answers: {
      conventions: [
        {
          idcc: "123",
          references: [
            {
              category: "ag",
              dila_cid: "c123",
              dila_container_id: "kalicont123",
              dila_id: "125",
            },
            {
              category: "ag",
              dila_cid: "ext",
              dila_container_id: "kalicont123",
              dila_id: "ext",
            },
            {
              category: "ag",
              dila_cid: "4",
              dila_container_id: "kalicont42",
              dila_id: "4",
            },
          ],
        },
      ],
      generic: {
        references: [
          {
            category: "ag",
            dila_cid: "c1",
            dila_container_id: "kalicont123",
            dila_id: "1",
          },
          {
            category: "ag",
            dila_cid: "3",
            dila_container_id: "kalicont42",
            dila_id: "3",
          },
        ],
      },
    },
    id: "answer1",
    title: "question1",
  },
]);

describe("getRelevantContent", () => {
  it("should return an array of document that match modified changes", () => {
    const changes = {
      added: [],
      modified: [{ data: { cid: "c123", id: "123" }, type: "article" }],
      removed: [],
    };
    const expected = [
      {
        document: {
          id: "answer1",
          idcc: "123",
          title: "question1",
          type: "contributions",
        },
        reference: {
          category: "ag",
          dila_cid: "c123",
          dila_container_id: "kalicont123",
          dila_id: "125",
        },
      },
    ];
    expect(getRelevantDocuments(changes)).toEqual(expected);
  });
  it("should return an array of document that match deleted changes", () => {
    const changes = {
      added: [],
      modified: [],
      removed: [{ data: { cid: "3", id: "3" }, type: "article" }],
    };
    const expected = [
      {
        document: {
          id: "answer1",
          title: "question1",
          type: "contributions",
        },
        reference: {
          category: "ag",
          dila_cid: "3",
          dila_container_id: "kalicont42",
          dila_id: "3",
        },
      },
    ];
    expect(getRelevantDocuments(changes)).toEqual(expected);
  });
});
