import fs from "fs";

import { populateLinks } from "../populateLinks";

jest.mock("fs");
jest.mock("../../context", () => ({
  context: { get: jest.fn() },
}));

describe("populateLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("attaches both document-type and l2-type recommended links to the matching document", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([
        {
          source_doc_id: "doc1",
          links: [
            {
              candidate_type: "document",
              candidate_id: "cand1",
              candidate_slug: "cand1-slug",
              candidate_source: "contributions",
              candidate_label: "Candidate one",
              candidate_l2: null,
              candidate_l1: null,
              confidence: "strong",
              combined_score: 1.23,
              combined_rank: 1,
            },
            {
              candidate_type: "l2",
              candidate_id: "some-theme",
              candidate_slug: null,
              candidate_source: null,
              candidate_label: "some-theme",
              candidate_l2: "some-theme",
              candidate_l1: "some-l1",
              confidence: "weak",
              combined_score: 0.5,
              combined_rank: 2,
            },
          ],
        },
      ])
    );

    const result = populateLinks([
      { cdtnId: "doc1", title: "Doc one" } as any,
    ]);

    expect(result).toEqual([
      {
        cdtnId: "doc1",
        title: "Doc one",
        links: [
          {
            type: "document",
            cdtnId: "cand1",
            slug: "cand1-slug",
            source: "contributions",
            title: "Candidate one",
            confidence: "strong",
            score: 1.23,
            rank: 1,
          },
          {
            type: "l2",
            l2: "some-theme",
            l1: "some-l1",
            title: "some-theme",
            confidence: "weak",
            score: 0.5,
            rank: 2,
          },
        ],
      },
    ]);
  });

  it("attaches an empty links array to a document missing from the file", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify([]));

    const result = populateLinks([
      { cdtnId: "unknown-doc", title: "Doc" } as any,
    ]);

    expect(result).toEqual([
      { cdtnId: "unknown-doc", title: "Doc", links: [] },
    ]);
  });
});
