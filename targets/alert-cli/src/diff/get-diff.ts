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
    await simpleGit().clone(`https://github.com/${project}`);
    const diffString = await simpleGit(repoPath).diff([
      `${fromTag}...${toTag}`,
    ]);
    const diffDetail = parsePatch(diffString);
    const result: GithubDiffFile[] = [];
    diffDetail.forEach((file) => {
      if (file.newFileName && !file.oldFileName) {
        result.push({
          filename: file.newFileName,
          status: "added",
        });
      } else if (file.newFileName && file.oldFileName) {
        result.push({
          filename: file.newFileName,
          status: "modified",
        });
      } else if (!file.newFileName && file.oldFileName) {
        result.push({
          filename: file.oldFileName,
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
