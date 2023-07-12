import { GithubDiffFile } from "../APIs/api";
import { simpleGit } from "simple-git";
import { parsePatch } from "diff";
import fs from "fs";

export async function getDiff(
  project: string,
  fromTag: string,
  toTag: string
): Promise<GithubDiffFile[]> {
  const repoPath = `/tmp/${project}`;
  try {
    if (fs.existsSync(repoPath)) {
      // remove the repo if it already exists
      fs.rmdirSync(repoPath, { recursive: true });
    }
    await simpleGit().clone(`https://github.com/${project}`, repoPath, {
      "--depth": 50,
    });
    const diffString = await simpleGit(repoPath).diff([
      `${fromTag}...${toTag}`,
    ]);
    const diffDetail = parsePatch(diffString);
    const result: GithubDiffFile[] = [];
    diffDetail.forEach((file) => {
      if (file.newFileName && !file.oldFileName) {
        result.push({
          filename: formatFileName(file.newFileName),
          status: "added",
        });
      } else if (file.newFileName && file.oldFileName) {
        result.push({
          filename: formatFileName(file.newFileName),
          status: "modified",
        });
      } else if (!file.newFileName && file.oldFileName) {
        result.push({
          filename: formatFileName(file.oldFileName),
          status: "removed",
        });
      }
    });
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function formatFileName(filename: string): string {
  const parts = filename.split("/");
  if (parts.length === 1) {
    return filename;
  }
  return parts.slice(1).join("/");
}
