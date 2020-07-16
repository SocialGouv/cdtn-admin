import { it, describe, expect, jest } from "@jest/globals";
import { getRelevantDocuments } from "../relevantContent";

jest.mock("@socialgouv/contributions-data/data/contributions.json", () => [
  {
    id: "answer1",
    title: "question1",
    answers: {
      generic: {
        references: [
          {
            category: "ag",
            dila_id: "1",
            dila_cid: "c1",
            dila_container_id: "kalicont123",
          },
          {
            category: "ag",
            dila_id: "3",
            dila_cid: "3",
            dila_container_id: "kalicont42",
          },
        ],
      },
      conventions: [
        {
          idcc: "123",
          references: [
            {
              category: "ag",
              dila_id: "125",
              dila_cid: "c123",
              dila_container_id: "kalicont123",
            },
            {
              category: "ag",
              dila_id: "ext",
              dila_cid: "ext",
              dila_container_id: "kalicont123",
            },
            {
              category: "ag",
              dila_id: "4",
              dila_cid: "4",
              dila_container_id: "kalicont42",
            },
          ],
        },
      ],
    },
  },
]);

describe("getRelevantContent", () => {
  it("should return an array of document that match modified changes", () => {
    const changes = {
      added: [],
      modified: [{ type: "article", data: { id: "123", cid: "c123" } }],
      removed: [],
    };
    const expected = [
      {
        document: {
          id: "answer1",
          type: "contributions",
          title: "question1",
          idcc: "123",
        },
        reference: {
          category: "ag",
          dila_id: "125",
          dila_cid: "c123",
          dila_container_id: "kalicont123",
        },
      },
    ];
    expect(getRelevantDocuments(changes)).toEqual(expected);
  });
  it("should return an array of document that match deleted changes", () => {
    const changes = {
      added: [],
      modified: [],
      removed: [{ type: "article", data: { id: "3", cid: "3" } }],
    };
    const expected = [
      {
        document: {
          id: "answer1",
          type: "contributions",
          title: "question1",
        },
        reference: {
          category: "ag",
          dila_id: "3",
          dila_cid: "3",
          dila_container_id: "kalicont42",
        },
      },
    ];
    expect(getRelevantDocuments(changes)).toEqual(expected);
  });
});
