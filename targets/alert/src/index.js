const { client } = require("@shared/graphql-client");

const path = require("path");
const nodegit = require("nodegit");
const semver = require("semver");
const { ccns } = require("./ccn-list.js");
const { compareArticles } = require("./compareTree.js");

const sourcesQuery = `
query getSources {
  sources {
    repository
    tag
  }
}
`;

const insertAlertsMutation = `
mutation insert_alerts($data: alerts_insert_input!) {
  alert: insert_alerts(objects: [$data]) {
    returning {
      ref,
      repository,
      info
    }
  }
}
`;

const updateSourceMutation = `
mutation updateSource($repository: String!, $tag: String!){
  source: update_sources_by_pk(
    _set:{
      tag: $tag
    },
    pk_columns: {
      repository: $repository
    }
  ){
    repository, tag
  }
}
`;

function getFileFilter(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (path) => /LEGITEXT000006072050\.json$/.test(path);
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (path) => ccns.some((ccn) => new RegExp(ccn.id).test(path));
    default:
      return () => true;
  }
}

function getFileComparator(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (art1, art2) =>
        art1.data.texte !== art2.data.texte ||
        art1.data.etat !== art2.data.etat ||
        art1.data.nota !== art2.data.nota;
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (art1, art2) =>
        art1.data.content !== art2.data.content ||
        art1.data.etat !== art2.data.etat;
    default:
      return () => true;
  }
}

function getFilename(patche) {
  return patche.newFile().path();
}

async function getSources() {
  const result = await client.query(sourcesQuery).toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("getSources");
  }
  return result.data.sources;
}

async function insertAlert(repository, changes) {
  const data = {
    repository,
    info: {
      num: changes.num,
      title: changes.title,
      id: changes.id,
      file: changes.file,
    },
    ref: changes.ref,
    changes: {
      added: changes.added,
      removed: changes.removed,
      modified: changes.modified,
    },
  };
  const result = await client
    .mutation(insertAlertsMutation, { data })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("insertAlert");
  }
  return result.data.alert;
}

async function updateSource(repository, tag) {
  const result = await client
    .mutation(updateSourceMutation, {
      repository,
      tag,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error("updateSource");
  }
  return result.data.source;
}

async function openRepo({ repository }) {
  const [org, repositoryName] = repository.split("/");
  const localPath = path.join(__dirname, "..", "data", repositoryName);
  let repo;
  try {
    repo = await nodegit.Repository.open(localPath);
    await repo.checkoutBranch("master");
    await repo.mergeBranches("master", "origin/master");
  } catch (err) {
    repo = await nodegit.Clone(
      `git://github.com/${org}/${repositoryName}`,
      localPath
    );
  }
  return repo;
}

async function getNewerTagsFromRepo(repo, tag) {
  const tags = await nodegit.Tag.list(repo);
  return await Promise.all(
    tags
      .flatMap((t) => {
        if (!semver.valid(t)) {
          return [];
        }
        if (semver.lt(t, tag)) {
          return [];
        }
        return t;
      })
      .sort((a, b) => (semver.lt(a, b) ? -1 : 1))
      .map(async (tag) => {
        const reference = await repo.getReference(tag);
        const targetRef = await reference.peel(nodegit.Object.TYPE.COMMIT);
        const commit = await repo.getCommit(targetRef);
        return {
          ref: tag,
          commit,
        };
      })
  );
}

async function getDiffFromTags(tags, id) {
  let [previousTag] = tags;
  const [, ...newTags] = tags;
  const changes = [];
  const fileFilter = getFileFilter(id);

  for (const tag of newTags) {
    const { commit: previousCommit } = previousTag;
    const { commit } = tag;
    const [prevTree, currTree] = await Promise.all([
      previousCommit.getTree(),
      commit.getTree(),
    ]);

    const patches = await currTree
      .diff(prevTree)
      .then((diff) => diff.patches());

    const files = patches.map(getFilename).filter(fileFilter);

    if (files.length > 0) {
      const fileChanges = await Promise.all(
        files.map((file) =>
          getFileDiffFromTrees(file, currTree, prevTree, getFileComparator(id))
        )
      );
      fileChanges
        .filter(
          (file) =>
            file.modified.length > 0 ||
            file.removed.length > 0 ||
            file.added.length > 0
        )
        .forEach((change) => {
          changes.push({ ref: tag.ref, ...change });
        });
    }
    previousTag = tag;
  }
  return changes;
}

async function getFileDiffFromTrees(
  filePath,
  currGitTree,
  prevGitTree,
  compareFn
) {
  const [currentFile, prevFile] = await Promise.all([
    currGitTree.getEntry(filePath).then((entry) => entry.getBlob()),
    prevGitTree.getEntry(filePath).then((entry) => entry.getBlob()),
  ]);
  const currTree = JSON.parse(currentFile.toString());
  const prevTree = JSON.parse(prevFile.toString());
  return {
    file: filePath,
    id: currTree.data.id,
    num: currTree.data.num,
    title: currTree.data.title,
    ...compareArticles(prevTree, currTree, compareFn),
  };
}

async function main() {
  const sources = await getSources();
  const results = [];
  for (const source of sources) {
    const repo = await openRepo(source);
    const tags = await getNewerTagsFromRepo(repo, source.tag);
    const diffs = await getDiffFromTags(tags, source.repository);
    const [lastTag] = tags.slice(-1);

    results.push({
      repository: source.repository,
      changes: diffs,
      newRef: lastTag.ref,
    });
  }

  if (process.env.DUMP) {
    console.log(JSON.stringify(results, 0, 2));
  } else {
    for (const result of results) {
      if (result.changes.length === 0) {
        console.log(`no update for ${result.repository}`);
        continue;
      }
      const inserts = await Promise.all(
        result.changes.map((diff) => insertAlert(result.repository, diff))
      );
      inserts.forEach((insert) => {
        const { ref, repository, info } = insert.returning[0];
        console.log(`insert alert for ${ref} on ${repository} (${info.file})`);
      });
      console.log(`create ${inserts.length} alert for ${result.repository}`);
      const update = await updateSource(result.repository, result.newRef);
      console.log(`update source ${update.repository} to ${update.tag}`);
    }
  }
}

main().catch(console.error);

module.exports = {
  getSources,
  insertAlert,
  updateSource,
};
