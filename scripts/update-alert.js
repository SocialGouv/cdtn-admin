import { client } from "../src/lib/graphqlApiClient.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import nodegit from "nodegit";
import semver from "semver";
import { ccns } from "./lib/ccn-list.js";
import { compareArticles } from "./lib/compareTree.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function insertAlert(changes) {
  const data = {
    info: {
      num: changes.num,
      title: changes.title,
      id: changes.id,
      file: changes.file,
    },
    ref: changes.ref,
    repository: changes.repository,
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
  console.info("insert alert", result.data.alert.returning);
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

  console.log(
    `update source ${result.data.source.repository} to ${result.data.source.tag}`
  );
}

async function openRepo({ repository }) {
  const [org, repositoryName] = repository.split("/");
  const localPath = path.join(__dirname, "..", "data", repositoryName);
  let repo;
  try {
    repo = await nodegit.Repository.open(localPath);
    await repo.fetch("origin");
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
      .map(async (tag) => ({
        ref: tag,
        commit: await repo.getReferenceCommit(tag),
      }))
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

async function getFileDiffFromTrees(filePath, treeA, treeB, compareFn) {
  const [fileA, fileB] = await Promise.all([
    treeA.getEntry(filePath).then((entry) => entry.getBlob()),
    treeB.getEntry(filePath).then((entry) => entry.getBlob()),
  ]);
  const jsonTreeA = JSON.parse(fileA.toString());
  const jsonTreeB = JSON.parse(fileB.toString());
  return {
    file: filePath,
    id: jsonTreeA.data.id,
    num: jsonTreeA.data.num,
    title: jsonTreeA.data.title,
    ...compareArticles(jsonTreeA, jsonTreeB, compareFn),
  };
}

async function main() {
  const sources = await getSources();
  // const results = [];
  for (const source of sources) {
    const repo = await openRepo(source);
    const tags = await getNewerTagsFromRepo(repo, source.tag);
    const diffs = await getDiffFromTags(tags, source.repository);

    await Promise.all(
      diffs.map(async (diff) => {
        diff.repository = source.repository;
        return await insertAlert(diff);

        // results.push({
        //   repository: source.repository,
        //   ...diff,
        // });
      })
    );
    if (diffs.length > 0) {
      const [lastTag] = tags.slice(-1);
      await updateSource(source.repository, lastTag.ref);
    } else {
      console.log(`no update for ${source.repository}`);
    }
  }

  // console.log(JSON.stringify(results, 0, 2));
}

main().catch(console.error);
