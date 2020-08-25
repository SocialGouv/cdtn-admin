import childProcess from "child_process";
import nodegit from "nodegit";
import path from "path";
import { promisify } from "util";

const exec = promisify(childProcess.exec);

/**
 * Open a nodegit Repository
 * @param {alerts.Source} source
 * @returns {Promise<nodegit.Repository>}
 */
export async function openRepo({ repository }) {
  const [org, repositoryName] = repository.split("/");
  const localPath = path.join(__dirname, "..", "data", repositoryName);
  let repo;
  try {
    repo = await nodegit.Repository.open(localPath);
  } catch (error) {
    console.error(
      `[error] openRepo: unable to open repository ${repository}, trying to clone it`
    );
    console.time(repository);
    // we use child_process since libgit2.clone is way too slow (x4 slower)
    // we normally shold use the code below
    // repo = await nodegit.Clone.clone(
    //   `https://github.com/${org}/${repositoryName}`,
    //   localPath,
    //   { bare: 1, checkoutBranch: "master", fetchOpts: { prune: 1 } }
    // );
    // we use bare repo as they weight less and we only need to read commit info
    await exec(
      `git clone --bare https://github.com/${org}/${repositoryName} ${localPath}`
    );
    repo = await nodegit.Repository.open(localPath);
    console.timeEnd(repository);
  }

  const remote = await nodegit.Remote.lookup(repo, "origin");
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
