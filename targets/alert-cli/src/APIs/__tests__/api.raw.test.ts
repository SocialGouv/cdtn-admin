import { GithubApi } from "../api";

const apiResponse = "raw file content";

global.fetch = jest.fn().mockImplementation((url) => {
  if (
    url ===
    "https://raw.githubusercontent.com/socialgouv/kali-data/v1.5.0/path/file"
  ) {
    return Promise.resolve({
      ok: true,
      text: async () => Promise.resolve(apiResponse),
    });
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
