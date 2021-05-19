import { expect, test } from "@jest/globals";

import main, { extractContributionsRef } from "../contribution";

jest.mock("../getAllDocumentsBySource", () => {
  return {
    getAllDocumentsBySource: () => mockContributions,
  };
});

//using name starting with mock allow jest to hoist variable and then mock
const mockContributions = [
  {
    document: {
      answers: {
        conventions: [
          {
            id: "id-answer-123",
            idcc: "123",
            markdown: "## markdown answer",
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
        ],
        generic: {
          description: "desc",
          id: "id-generic",
          markdown: "##markdown",
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
          text: "text",
        },
      },
      id: "answer1",
      index: 1,
    },
    id: "answer1",
    initial_id: "contrib-1",
    is_available: false,
    is_published: false,
    is_searchable: false,
    meta_description: "desc",
    slug: "contrib-slug",
    source: "contributions",
    text: "text",
    title: "question1",
  },
];

const expected = [
  {
    document: {
      id: "answer1",
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
];

test("extractContributionRef should return an array of references", () => {
  expect(
    extractContributionsRef(
      /** @type {import("@shared/types").ContributionDocument[]} */ (mockContributions)
    )
  ).toEqual(expected);
});

test("default export should return an array of references", async () => {
  expect(await main()).toEqual(expected);
});
