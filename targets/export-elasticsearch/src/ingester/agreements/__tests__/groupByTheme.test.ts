import { groupByTheme } from "../groupByTheme";
import { ExportAnswer } from "@socialgouv/cdtn-types";

describe("contributionsByTheme", () => {
  it("should throw if a contrib has no theme", () => {
    expect(() => {
      groupByTheme([
        { slug: "hello", questionIndex: 1, title: "contrib" },
      ]);
    }).toThrow("Contribution [1] - hello has no theme.");
  });

  it("returns the first breadcrumb label", () => {
    const data: ExportAnswer[] = [
      { slug: "contrib-1", questionIndex: 1, theme: "A", title: "contrib" },
      { slug: "contrib-1", questionIndex: 1, theme: "C", title: "contrib" },
      { slug: "contrib-1", questionIndex: 1, theme: "B", title: "contrib" },
      { slug: "contrib-2", questionIndex: 2, theme: "A", title: "contrib" },
    ];

    expect(groupByTheme(data)).toEqual([
      {
        "answers": [
          {
            "questionIndex": 1,
            "slug": "contrib-1",
            "theme": "A",
            "title": "contrib"
          },
          {
            "questionIndex": 2,
            "slug": "contrib-2",
            "theme": "A",
            "title": "contrib"
          }
        ],
        "theme": "A"
      },
      {
        "answers": [
          {
            "questionIndex": 1,
            "slug": "contrib-1",
            "theme": "B",
            "title": "contrib"
          }
        ],
        "theme": "B"
      },
      {
        "answers": [
          {
            "questionIndex": 1,
            "slug": "contrib-1",
            "theme": "C",
            "title": "contrib"
          }
        ],
        "theme": "C"
      }
    ]);
  });
});
