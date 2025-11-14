import { groupByTheme } from "../groupByTheme";
import { ExportAnswer } from "@socialgouv/cdtn-types";

describe("contributionsByTheme", () => {
  it("should throw if a contrib has no theme", () => {
    expect(() => {
      groupByTheme([{ slug: "hello", questionIndex: 1, question: "contrib" }]);
    }).toThrow("Contribution [1] - hello has no theme.");
  });

  it("returns the first breadcrumb label", () => {
    const data: ExportAnswer[] = [
      { slug: "contrib-1", questionIndex: 1, theme: "A", question: "contrib" },
      { slug: "contrib-1", questionIndex: 1, theme: "C", question: "contrib" },
      { slug: "contrib-1", questionIndex: 1, theme: "B", question: "contrib" },
      { slug: "contrib-2", questionIndex: 2, theme: "A", question: "contrib" },
    ];

    expect(groupByTheme(data)).toEqual([
      {
        answers: [
          {
            questionIndex: 1,
            slug: "contrib-1",
            theme: "A",
            question: "contrib",
          },
          {
            questionIndex: 2,
            slug: "contrib-2",
            theme: "A",
            question: "contrib",
          },
        ],
        theme: "A",
      },
      {
        answers: [
          {
            questionIndex: 1,
            slug: "contrib-1",
            theme: "B",
            question: "contrib",
          },
        ],
        theme: "B",
      },
      {
        answers: [
          {
            questionIndex: 1,
            slug: "contrib-1",
            theme: "C",
            question: "contrib",
          },
        ],
        theme: "C",
      },
    ]);
  });
});
