import { getDiff } from "../get-diff";

describe("getDiff", () => {
  it("should return an empty array if the project does not exist", async () => {
    const project = "does-not-exist-blabla";
    const fromTag = "v1.0.0";
    const toTag = "v2.0.0";
    const diff = await getDiff(project, fromTag, toTag);
    expect(diff).toEqual([]);
  });

  it("should return an array of GithubDiffFile s if the project, fromTag, and toTag exist", async () => {
    const project = "socialgouv/kali-data";
    const fromTag = "v2.579.0";
    const toTag = "v2.580.0";
    const diff = await getDiff(project, fromTag, toTag);
    expect(diff).toEqual([
      {
        filename: "b/CHANGELOG.md",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635096.json",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635206.json",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635337.json",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635405.json",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635597.json",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635616.json",
        status: "modified",
      },
      {
        filename: "b/data/KALICONT000005635649.json",
        status: "modified",
      },
      {
        filename: "b/data/articles/index.json",
        status: "modified",
      },
      {
        filename: "b/package.json",
        status: "modified",
      },
    ]);
  }, 10000000);
});
