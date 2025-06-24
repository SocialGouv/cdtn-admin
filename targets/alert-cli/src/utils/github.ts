import { Commit, GitTagData, Diff } from "../types";
import { getDiff } from "./get-diff";

export type Tags = GitTagData[];

type GithubTagsResponse = GithubTag[];

interface GithubTag {
  name: string;
  commit: {
    url: string;
  };
}

interface GithubResponse {
  files?: GithubDiffFile[];
}

export interface GithubDiffFile {
  filename: string;
  status: "added" | "modified" | "removed";
}

interface CommitGithubResponse {
  commit: {
    author: {
      // Date ISO format : 2023-06-15T04:35:19Z
      date: Date;
    };
  };
}

export class GithubApi {
  githubToken: string;

  constructor(githubToken: string) {
    this.githubToken = githubToken;
  }

  async tags(project: string, untilTag: string): Promise<Tags> {
    let page = 1;
    const allTags = [];
    let tags = [];
    do {
      tags = await this._tags(project, page);
      for (const tag of tags) {
        allTags.push(tag);
        if (tag.ref === untilTag) {
          return allTags;
        }
      }
      page = page + 1;
    } while (tags.length > 0);
    return allTags;
  }

  private async _tags(project: string, page = 1, limit = 5): Promise<Tags> {
    const url = `https://api.github.com/repos/${project}/tags?per_page=${limit}&page=${page}`;
    const tags = await this.fetchJson<GithubTagsResponse>(url);
    return Promise.all(
      tags.map(async (tag) => {
        const commit = await this.loadCommit(tag);
        return { ref: tag.name, commit };
      })
    );
  }

  private async loadCommit(tag: GithubTag): Promise<Commit> {
    const json = await this.fetchJson<CommitGithubResponse>(tag.commit.url);
    return { date: new Date(json.commit.author.date) };
  }

  async diff(project: string, from: GitTagData, to: GitTagData): Promise<Diff> {
    try {
      let page = 1;
      let allDiffs: GithubDiffFile[] = [];
      let diffs: GithubDiffFile[] = [];
      do {
        diffs = await this._diff(project, from.ref, to.ref, page);
        allDiffs = allDiffs.concat(diffs);
        page = page + 1;
      } while (diffs.length > 0);
      return {
        from,
        to,
        files: allDiffs,
      };
    } catch (e: unknown) {
      console.error(
        `Failed to fetch diff ${from.ref} > ${to.ref}, fallback to local git diff`,
        e
      );
      return this.localDiff(project, from, to);
    }
  }

  private async _diff(
    project: string,
    from: string,
    to: string,
    page = 1,
    limit = 100
  ): Promise<GithubDiffFile[]> {
    const url = `https://api.github.com/repos/${project}/compare/${from}...${to}?per_page=${limit}&page=${page}`;
    const diffs = await this.fetchJson<GithubResponse>(url);
    return (
      diffs.files?.map((diff) => ({
        filename: diff.filename,
        status: diff.status,
      })) ?? []
    );
  }

  private async localDiff(
    project: string,
    from: GitTagData,
    to: GitTagData
  ): Promise<Diff> {
    const allDiffs: GithubDiffFile[] = await getDiff(project, from.ref, to.ref);
    return {
      from,
      to,
      files: allDiffs,
    };
  }

  async raw(project: string, path: string, tag: GitTagData): Promise<string> {
    const url = `https://raw.githubusercontent.com/${project}/${tag.ref}/${path}`;
    return this.fetchText(url);
  }

  private async fetchGithub(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.githubToken}`,
      },
    });
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetchGithub(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch url ${url} - ${response.status} : ${response.statusText}`
      );
    }
    const data = await response.json();
    return data as T;
  }

  private async fetchText(url: string): Promise<string> {
    const response = await this.fetchGithub(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url} - ${response.status} : ${response.statusText}`
      );
    }
    return response.text();
  }
}
