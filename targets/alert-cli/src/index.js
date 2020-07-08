import { client } from "@shared/graphql-client";
import path from "path";
import nodegit from "nodegit";
import semver from "semver";

import { ccns } from "./ccn-list.js";
import { compareArticles } from "./compareTree.js";
import { getRelevantDocuments } from "./relevantContent.js";

const sourcesQuery = `
query getSources {
  sources {
    repository
    tag
  }
}
`;

const insertAlertsMutation = `
mutation insert_alert($alert: alerts_insert_input!) {
  alert: insert_alerts_one(object: $alert) {
    repository,
    ref
    info
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

/**
 *
 * @param { string } repository
 * @returns { alerts.fileFilterFn }
 */
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

/**
 *
 * @param { string } repository
 * @returns { alerts.nodeComparatorFn }
 */
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

/**
 * @param { nodegit.ConvenientPatch } patche
 * @returns { string }
 */
function getFilename(patche) {
  return patche.newFile().path();
}

/**
 *
 * @param {string} file
 * @returns {(tree:nodegit.Tree) => import("unist-util-parents").NodeWithParent}
 */
function createToAst(file) {
  return (tree) =>
    tree
      .getEntry(file)
      .then((entry) => entry.getBlob())
      .then((blob) => JSON.parse(blob.toString()));
}

/**
 * @returns { Promise<alerts.Source[]> }
 */
async function getSources() {
  const result = await client.query(sourcesQuery).toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("getSources");
  }
  return result.data.sources;
}

/**
 * @param { string } repository
 * @param { alerts.AlertChanges } changes
 * @returns { Promise<alerts.Alert> }
 */
export async function insertAlert(repository, changes) {
  const alert = {
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
    .mutation(insertAlertsMutation, { alert })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("insertAlert");
  }
  return result.data.alert;
}
/**
 *
 * @param { string } repository
 * @param { string } tag
 * @returns {Promise<alerts.Source>}
 */
export async function updateSource(repository, tag) {
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
/**
 *
 * @param {alerts.Source} source
 * @returns {Promise<nodegit.Repository>}
 */
async function openRepo({ repository }) {
  const [org, repositoryName] = repository.split("/");
  const localPath = path.join(__dirname, "..", "data", repositoryName);
  let repo;
  try {
    repo = await nodegit.Repository.open(localPath);
    await repo.fetch("origin");
    await repo.checkoutBranch("master");
    await repo.mergeBranches("master", "origin/master");
  } catch (err) {
    console.error(err);
    repo = await nodegit.Clone.clone(
      `git://github.com/${org}/${repositoryName}`,
      localPath
    );
  }
  return repo;
}
/**
 *
 * @param {nodegit.Repository} repository
 * @param {string} lastTag
 * @returns {Promise<alerts.GitTagData[]>}
 */
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
          ref: tag,
          commit,
        };
      })
  );
}

/**
 *
 * @param {alerts.GitTagData[]} tags
 * @param {string} repositoryId
 * @returns {Promise<alerts.AlertChanges[]>}
 */
async function getDiffFromTags(tags, repositoryId) {
  let [previousTag] = tags;
  const [, ...newTags] = tags;

  /** @type alerts.AlertChanges[] */
  const changes = [];

  const fileFilter = getFileFilter(repositoryId);
  const compareFn = getFileComparator(repositoryId);

  for (const tag of newTags) {
    const previousCommit = previousTag.commit;
    const { commit } = tag;
    const [prevTree, currTree] = await Promise.all([
      previousCommit.getTree(),
      commit.getTree(),
    ]);

    const diff = await currTree.diff(prevTree);
    const patches = await diff.patches();

    const files = patches.map(getFilename).filter(fileFilter);

    if (files.length > 0) {
      const fileChanges = await Promise.all(
        files.map(async (file) => {
          const toAst = createToAst(file);
          const [currAst, prevAst] = await Promise.all(
            [currTree, prevTree].map(toAst)
          );

          const changes = compareArticles(prevAst, currAst, compareFn);
          const documents = getRelevantDocuments(changes);
          return {
            file,
            id: currAst.data.id,
            num: currAst.data.num,
            title: currAst.data.title,
            documents,
            ...changes
          };
        })
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
    console.log(JSON.stringify(results, null, 2));
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
        const { ref, repository, info } = insert;
        console.log(`insert alert for ${ref} on ${repository} (${info.file})`);
      });
      console.log(`create ${inserts.length} alert for ${result.repository}`);
      // const update = await updateSource(result.repository, result.newRef);
      // console.log(`update source ${update.repository} to ${update.tag}`);
    }
  }
}

main().catch(console.error);
