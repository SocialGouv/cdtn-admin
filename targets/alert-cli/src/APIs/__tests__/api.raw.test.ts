import { GithubApi } from "../api";
import fetch from "node-fetch";

jest.mock("node-fetch", () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
}));

const apiResponse = "raw file content";

const mockFetch = fetch as unknown as jest.Mock;
mockFetch.mockImplementation((url) => {
  if (
    url ===
    "https://raw.githubusercontent.com/socialgouv/kali-data/v1.5.0/path/file"
  ) {
    return {
      ok: true,
      text: async () => Promise.resolve(apiResponse),
    };
  }
});

describe("Github API: raw file", () => {
  const api = new GithubApi("");
  it("should return the raw file of the selected version", async () => {
    const diff = await api.raw("socialgouv/kali-data", "path/file", {
      ref: "v1.5.0",
      commit: { date: new Date() },
    });
    expect(diff).toStrictEqual(apiResponse);
  });
});
