import childProcess from "child_process";
import nodegit from "nodegit";
import path from "path";
import semver from "semver";
import { promisify } from "util";

const exec = promisify(childProcess.exec);

async function getNewerTagsFromRepo(repository, lastTag) {
  /** @type {string[]} */
  const tags = await nodegit.Tag.list(repository);
  return await Promise.all(
    tags
      .flatMap((t) => {
        if (!semver.valid(t)) {
          return [];
        }
        if (semver.lt(t, lastTag)) {
          return [];
        }
        return t;
      })
      .sort((a, b) => (semver.lt(a, b) ? -1 : 1))
      .map(async (tag) => {
        const reference = await repository.getReference(tag);
        const targetRef = await reference.peel(nodegit.Object.TYPE.COMMIT);
        const commit = await repository.getCommit(targetRef.id());
        return {
          commit,
          ref: tag,
        };
      })
  );
}

async function openRepo({ repository }) {
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
    const { stdout } = await exec("pwd");
    console.log(stdout);
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
async function main() {
  const repo = await openRepo({ repository: "lionelb/sandbox" });
  const tags = await getNewerTagsFromRepo(repo, "v1.0.0");
  console.error(tags);
}

main().catch(console.error);
