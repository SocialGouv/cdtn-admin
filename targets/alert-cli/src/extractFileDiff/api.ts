import fetch from "node-fetch";

export type Tags = string[];

type GithubTagsResponse = GithubTag[];

interface GithubTag {
  name: string;
}

export class GithubApi {
  async loadTagsUntil(project: string, untilTag: string): Promise<Tags> {
    let page = 1;
    const allTags = [];
    let tags = [];
    do {
      tags = await this.loadTags(project, page);
      for (const tag of tags) {
        if (tag === untilTag) {
          return allTags;
        } else {
          allTags.push(tag);
        }
      }
      page = page + 1;
    } while (tags.length > 0);
    return allTags;
  }

  private async loadTags(project: string, page = 1, limit = 5): Promise<Tags> {
    const url = `https://api.github.com/repos/SocialGouv/${project}/tags?per_page=${limit}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch tags for project ${project} (page: ${page} and limit: ${limit})`
      );
    }
    const json = (await response.json()) as GithubTagsResponse;
    return json.map((tag) => tag.name);
  }
}
