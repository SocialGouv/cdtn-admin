import { GithubApi } from "../api";
import fetch from "node-fetch";

jest.mock("node-fetch", () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
}));

const apiResponse = [
  {
    name: "v1.7.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
  {
    name: "v1.6.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
  {
    name: "v1.5.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
  {
    name: "v1.4.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
  {
    name: "v1.3.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
];

const apiResponsePage2 = [
  {
    name: "v1.2.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
  {
    name: "v1.1.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
  {
    name: "v1.0.0",
    commit: {
      url: "https://commit/v1.7.0",
    },
  },
];

const formatCommitResponse = (tag: string) => ({
  commit: {
    author: {
      date: tag,
    },
  },
});

const mockFetch = fetch as unknown as jest.Mock;
mockFetch.mockImplementation((url: string) => {
  switch (url) {
    case "https://api.github.com/repos/socialgouv/kali-data/tags?per_page=5&page=1":
      return {
        ok: true,
        json: async () => Promise.resolve(apiResponse),
      };
    case "https://api.github.com/repos/socialgouv/kali-data/tags?per_page=5&page=2":
      return {
        ok: true,
        json: async () => Promise.resolve(apiResponsePage2),
      };
    case "https://api.github.com/repos/socialgouv/kali-data/tags?per_page=5&page=3":
      return {
        ok: true,
        json: async () => Promise.resolve([]),
      };
  }
  if (url.startsWith("https://commit")) {
    return {
      ok: true,
      json: async () =>
        Promise.resolve({
          commit: {
            author: {
              date: "2023-06-15T04:35:19Z",
            },
          },
        }),
    };
  }
});
describe("Github API: list tags", () => {
  const api = new GithubApi();
  it("should return tags until v1.5.0", async () => {
    const tags = await api.tags("socialgouv/kali-data", "v1.5.0");
    expect(tags).toStrictEqual([
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.7.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.6.0",
      },
    ]);
  });

  it("should return tags until v1.1.0 (should fetch page 2)", async () => {
    const tags = await api.tags("socialgouv/kali-data", "v1.1.0");
    expect(tags).toStrictEqual([
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.7.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.6.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.5.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.4.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.3.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.2.0",
      },
    ]);
  });

  it("should return all tags if version not found", async () => {
    const tags = await api.tags("socialgouv/kali-data", "v2.0.0");
    expect(tags).toStrictEqual([
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.7.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.6.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.5.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.4.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.3.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.2.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.1.0",
      },
      {
        commit: {
          date: new Date("2023-06-15T04:35:19.000Z"),
        },
        ref: "v1.0.0",
      },
    ]);
  });
});
