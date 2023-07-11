import { getDiff } from "../get-diff";

describe("getDiff", () => {
  it("should return an empty array if the project does not exist", async () => {
    const project = "does-not-exist-blabla";
    const fromTag = "v1.0.0";
    const toTag = "v2.0.0";
    const diff = await getDiff(project, fromTag, toTag);
    expect(diff).toEqual([]);
  });
});
