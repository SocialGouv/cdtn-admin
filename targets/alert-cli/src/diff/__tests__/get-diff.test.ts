import { formatFileName, getDiff } from "../get-diff";

describe("getDiff", () => {
  it("should return an empty array if the project does not exist", async () => {
    const project = "does-not-exist-blabla";
    const fromTag = "v1.0.0";
    const toTag = "v2.0.0";
    const diff = await getDiff(project, fromTag, toTag);
    expect(diff).toEqual([]);
  });
});

describe("formatFileName", () => {
  it("should return the filename without the first directory", () => {
    const filename = "b/to/file.txt";
    const expected = "to/file.txt";
    const result = formatFileName(filename);
    expect(result).toEqual(expected);
  });

  it("should return an empty string if the input is an empty string", () => {
    const filename = "";
    const expected = "";
    const result = formatFileName(filename);
    expect(result).toEqual(expected);
  });

  it("should return the input string if it does not contain any forward slashes", () => {
    const filename = "filename.txt";
    const expected = "filename.txt";
    const result = formatFileName(filename);
    expect(result).toEqual(expected);
  });

  it("should return an empty string if the input string only contains forward slashes", () => {
    const filename = "/";
    const expected = "";
    const result = formatFileName(filename);
    expect(result).toEqual(expected);
  });
});
