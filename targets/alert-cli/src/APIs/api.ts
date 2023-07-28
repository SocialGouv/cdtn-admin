import { Commit, GitTagData } from "../types";
import { Diff } from "../diff/type";
import { getDiff } from "../diff/get-diff";

export type Tags = GitTagData[];

type GithubTagsResponse = GithubTag[];

interface GithubTag {
  name: string;
  commit: {
    url: string;
  };
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
    const tagsWithCommit = await Promise.all(
      tags.map(async (tag) => {
        const commit = await this.loadCommit(tag);
        return { ref: tag.name, commit };
      })
    );
    return tagsWithCommit;
  }

  private async loadCommit(tag: GithubTag): Promise<Commit> {
    const json = await this.fetchJson<CommitGithubResponse>(tag.commit.url);
    return { date: new Date(json.commit.author.date) };
  }

  async diff(project: string, from: GitTagData, to: GitTagData): Promise<Diff> {
    const allDiffs: GithubDiffFile[] = await getDiff(project, from.ref, to.ref);
    return {
      from,
      to,
      files: allDiffs,
    };
  }

  async raw(project: string, path: string, tag: GitTagData): Promise<string> {
    const url = `https://raw.githubusercontent.com/${project}/${tag.ref}/${path}`;
    const data = await this.fetchText(url, true);
    return data;
  }

  private async fetchGithub(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.githubToken}`,
      },
    });
    return response;
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

  private async fetchText(url: string, ignoreError?: boolean): Promise<string> {
    const response = await this.fetchGithub(url);
    if (!response.ok) {
      if (ignoreError) {
        console.error(
          `Failed to fetch ${url} - ${response.status} : ${response.statusText}`
        );
        return "";
      } else {
        throw new Error(
          `Failed to fetch ${url} - ${response.status} : ${response.statusText}`
        );
      }
    }
    return response.text();
  }
}
