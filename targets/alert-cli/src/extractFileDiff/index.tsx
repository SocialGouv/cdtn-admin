import {GithubApi} from "./api";

export interface FileDiff {
  path: string;
  isModified: boolean;
  isAdded: boolean;
  isDeleted: boolean;
}

const extractFileDiff = (project: string, currentTag: string) => {
  const api = new GithubApi()
  const tags = api.loadTagsUntil(project, currentTag)

};
