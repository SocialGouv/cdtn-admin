import childProcess from "child_process";
import { Remote, Repository } from "nodegit";
import path from "path";
import { promisify } from "util";

import type { Source } from "./types";

const exec = promisify(childProcess.exec);

export async function openRepo({
  repository,
  tag,
}: Source): Promise<Repository> {
  const [org, repositoryName] = repository.split("/");
  const localPath = path.join(__dirname, "..", "data", repositoryName);

  try {
    console.time(repository);
    // we use child_process since libgit2.clone is way too slow (x4 slower)
    // we normally shold use the code below
    // repo = await nodegit.Clone.clone(
    //   `https://github.com/${org}/${repositoryName}`,
    //   localPath,
    //   { bare: 1, checkoutBranch: "master", fetchOpts: { prune: 1 } }
    // );
    // we use bare repo as they weight less and we only need to read commit info

    /**
     * The option --shallow-exclude ${tag}
     * allow us to only clone repo with history limited to a given revision (or tag)
     * that way we do not clone the entire history nor fetch all the existing tag
     */
    const command = `git clone --shallow-exclude ${tag} --bare https://github.com/${org}/${repositoryName} ${localPath}`;
    console.log(command);
    await exec(command);
    /**
     * Since swallow exlude remove our base tag, we need to add it
     * to our swallow cloned repo to avoid drop the first tag
     * so we can get diff from the last time
     * ex: git swallow-exclude v2.31.0 will contains tags v2.32, v2.33, ...
     * and when we compute diff from tags, we will compute
     * diff between v2.32.0 to v2.33.0, v2.33.0 to v2.34.0
     * using deepen, we will the commit previous v2.32.0 so
     * swallow repo will contains v2.31.0 tag
     * We can now compute diff from the last saved tag.
     */
    const deepenCommand = `cd ${localPath} && git fetch --deepen 1`;
    console.log(deepenCommand);
    await exec(deepenCommand);
    console.timeEnd(repository);
  } catch {
    const commandClone = `git clone --depth 1 --bare https://github.com/${org}/${repositoryName} ${localPath}`;
    await exec(commandClone);
    console.log(`[openRepo] no new version, fallback to`);
    console.log(` ${commandClone}`);
  }
  const repo = await Repository.open(localPath);
  const remote = await Remote.lookup(repo, "origin");
  await remote.fetch(
    ["+refs/heads/master:refs/remotes/origin/master"],
    {
      downloadTags: 1,
      prune: 1,
      updateFetchhead: 1,
    },
    "update"
  );
  return repo;
}
