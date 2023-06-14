import { GithubApi } from "../api";
import fetch from "node-fetch";

jest.mock("node-fetch", () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
}));

const apiResponse = [
  {
    name: "v1.7.0",
  },
  {
    name: "v1.6.0",
  },
  {
    name: "v1.5.0",
  },
  {
    name: "v1.4.0",
  },
  {
    name: "v1.3.0",
  },
];

const apiResponsePage2 = [
  {
    name: "v1.2.0",
  },
  {
    name: "v1.1.0",
  },
  {
    name: "v1.0.0",
  },
];

const mockFetch = fetch as unknown as jest.Mock;
mockFetch.mockImplementation((url) => {
  switch (url) {
    case "https://api.github.com/repos/SocialGouv/kali-data/tags?per_page=5&page=1":
      return {
        ok: true,
        json: async () => Promise.resolve(apiResponse),
      };
    case "https://api.github.com/repos/SocialGouv/kali-data/tags?per_page=5&page=2":
      return {
        ok: true,
        json: async () => Promise.resolve(apiResponsePage2),
      };
    case "https://api.github.com/repos/SocialGouv/kali-data/tags?per_page=5&page=3":
      return {
        ok: true,
        json: async () => Promise.resolve([]),
      };
  }
});
describe("Github API", () => {
  const api = new GithubApi();
  it("should return tags until v1.5.0", async () => {
    const tags = await api.loadTagsUntil("kali-data", "v1.5.0");
    expect(tags).toStrictEqual(["v1.7.0", "v1.6.0"]);
  });

  it("should return tags until v1.1.0 (should fetch page 2)", async () => {
    const tags = await api.loadTagsUntil("kali-data", "v1.1.0");
    expect(tags).toStrictEqual([
      "v1.7.0",
      "v1.6.0",
      "v1.5.0",
      "v1.4.0",
      "v1.3.0",
      "v1.2.0",
    ]);
  });

  it("should return all tags if version not found", async () => {
    const tags = await api.loadTagsUntil("kali-data", "v2.0.0");
    expect(tags).toStrictEqual([
      "v1.7.0",
      "v1.6.0",
      "v1.5.0",
      "v1.4.0",
      "v1.3.0",
      "v1.2.0",
      "v1.1.0",
      "v1.0.0",
    ]);
  });
});
