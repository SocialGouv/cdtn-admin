import { GithubApi } from "../api";
import fetch from "node-fetch";

jest.mock("node-fetch", () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
}));

const apiResponse = {
  files: [
    {
      sha: "sha1",
      filename: "file1.txt",
      status: "added",
    },
    {
      sha: "sha2",
      filename: "file2.txt",
      status: "removed",
    },
    {
      sha: "sha3",
      filename: "file3.txt",
      status: "modified",
    },
  ],
};

const apiResponsePage2 = {
  files: [
    {
      sha: "sha1",
      filename: "file4.txt",
      status: "added",
    },
    {
      sha: "sha2",
      filename: "file5.txt",
      status: "removed",
    },
    {
      sha: "sha3",
      filename: "file6.txt",
      status: "modified",
    },
  ],
};

const mockFetch = fetch as unknown as jest.Mock;
mockFetch.mockImplementation((url) => {
  switch (url) {
    case "https://api.github.com/repos/socialgouv/kali-data/compare/v1.4.0...v1.5.0?per_page=100&page=1":
      return {
        ok: true,
        json: async () => Promise.resolve(apiResponse),
      };
    case "https://api.github.com/repos/socialgouv/kali-data/compare/v1.4.0...v1.5.0?per_page=100&page=2":
      return {
        ok: true,
        json: async () => Promise.resolve(apiResponsePage2),
      };
    case "https://api.github.com/repos/socialgouv/kali-data/compare/v1.4.0...v1.5.0?per_page=100&page=3":
      return {
        ok: true,
        json: async () => Promise.resolve([]),
      };
  }
});

describe("Github API: list diff", () => {
  const api = new GithubApi("");
  it("should return file diff between two versions", async () => {
    const diff = await api.diff(
      "socialgouv/kali-data",
      { ref: "v1.4.0", commit: { date: new Date() } },
      { ref: "v1.5.0", commit: { date: new Date() } }
    );
    expect(diff.from.ref).toStrictEqual("v1.4.0");
    expect(diff.to.ref).toStrictEqual("v1.5.0");
    expect(diff.files).toStrictEqual([
      {
        filename: "file1.txt",
        status: "added",
      },
      {
        filename: "file2.txt",
        status: "removed",
      },
      {
        filename: "file3.txt",
        status: "modified",
      },
      {
        filename: "file4.txt",
        status: "added",
      },
      {
        filename: "file5.txt",
        status: "removed",
      },
      {
        filename: "file6.txt",
        status: "modified",
      },
    ]);
  });
});
