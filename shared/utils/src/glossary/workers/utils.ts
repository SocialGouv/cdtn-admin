import path from "path";

export function getMonorepoRoot(currentPath: string, rootDirName: string) {
  let dir = currentPath;

  while (dir !== path.parse(dir).root) {
    if (path.basename(dir) === rootDirName) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  return "";
}
