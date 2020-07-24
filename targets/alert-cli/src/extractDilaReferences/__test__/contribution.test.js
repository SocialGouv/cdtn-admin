import { expect, jest, test } from "@jest/globals";
import contributions from "@socialgouv/contributions-data/data/contributions.json";

import main, { extractContributionsRef } from "../contribution";

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

const expected = [
  {
    document: {
      id: "answer1",
      title: "question1",
      type: "contributions",
    },
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
  {
    document: {
      id: "answer1",
      idcc: "123",
      title: "question1",
      type: "contributions",
    },
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
