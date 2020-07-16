import { describe, expect, test, jest } from "@jest/globals";
import contributions from "@socialgouv/contributions-data/data/contributions.json";
import main, { extractContributionsRef } from "../contribution";

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

const expected = [
  {
    document: {
      id: "answer1",
      type: "contributions",
      title: "question1",
    },
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
  {
    document: {
      id: "answer1",
      type: "contributions",
      title: "question1",
      idcc: "123",
    },
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
];

test("extractContributionRef should return an array of references", () => {
  expect(
    extractContributionsRef(
      /** @type {import("@socialgouv/contributions-data").Question[]} */ (contributions)
    )
  ).toEqual(expected);
});

test("default export should return an array of references", () => {
  expect(main()).toEqual(expected);
});
