import { client } from "@shared/graphql-client";
import fiches from "@socialgouv/datafiller-data/data/externals.json";
import nodegit from "nodegit";
import semver from "semver";

import { batchPromises } from "./batchPromises";
import { ccns } from "./ccn-list.js";
import { compareArticles } from "./compareTree.js";
import { processTravailDataDiff } from "./diff/fiches-travail-data";
import { processVddDiff } from "./diff/fiches-vdd";
import { createToJson, getFilename } from "./node-git.helpers";
import { openRepo } from "./openRepo";
import { getRelevantDocuments } from "./relevantContent.js";

/** @type {string[]} */
let listFichesVddId = [];
const fichesVdd = fiches.find(({ title }) => title === "service-public.fr");
if (fichesVdd) {
  listFichesVddId = fichesVdd.urls.flatMap((url) => url.match(/\w\d+$/) || []);
}

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
  alert: insert_alerts_one(object: $alert,  on_conflict: {
    constraint: alerts_ref_info_key,
    update_columns: [changes]
  }) {
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
    case "socialgouv/fiches-vdd":
      return (path) => {
        const matched = ["index.json", ...listFichesVddId].some((id) =>
          new RegExp(`${id}.json$`).test(path)
        );
        return matched;
      };
    case "socialgouv/fiches-travail-data":
      return (path) => /fiches-travail\.json$/.test(path);
    default:
      return () => false;
  }
}

/**
 *
 * @param { string } repository
 * @returns { alerts.nodeComparatorFn<alerts.DilaNode> }
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
      return () => false;
  }
}
/**
 *
 * @param { string } repository
 */
function getDiffProcessor(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
    case "socialgouv/kali-data":
      return processDilaDiff;
    case "socialgouv/fiches-vdd":
      return processVddDiff;
    case "socialgouv/fiches-travail-data":
      return processTravailDataDiff;
    default:
      return () => Promise.resolve([]);
  }
}

/**
 *
 * @param {string} repositoryId
 * @param {alerts.GitTagData} tag
 * @param {string[]} files
 * @param {nodegit.Tree} prevTree
 * @param {nodegit.Tree} currTree
 * @returns {Promise<alerts.DilaAlertChanges[]>}
 */
async function processDilaDiff(repositoryId, tag, files, prevTree, currTree) {
  const compareFn = getFileComparator(repositoryId);
  const fileChanges = await Promise.all(
    files.map(async (file) => {
      const toAst = createToJson(file);

      const [
        currAst,
        prevAst,
      ] = /** @type {alerts.DilaNode[]} */ (await Promise.all(
        [currTree, prevTree].map(toAst)
      ));

      const changes = compareArticles(prevAst, currAst, compareFn);
      const documents = getRelevantDocuments(changes);

      return {
        documents,
        file,
        id: currAst.data.id,
        num: currAst.data.num,
        title: currAst.data.title,
        ...changes,
      };
    })
  );

  return fileChanges
    .filter(
      (file) =>
        file.modified.length > 0 ||
        file.removed.length > 0 ||
        file.added.length > 0 ||
        file.documents.length > 0
    )
    .map((change) => ({
      date: tag.commit.date(),
      ref: tag.ref,
      ...change,
      type: "dila",
    }));
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
    changes: {
      added: changes.added,
      modified: changes.modified,
      removed: changes.removed,
      ...(changes.type === "dila" && { documents: changes.documents }),
    },
    created_at: changes.date,
    info: {
      title: changes.title,
      type: changes.type,
      ...(changes.type === "dila" && {
        file: changes.file,
        id: changes.id,
        num: changes.num,
        title: changes.title,
      }),
    },
    ref: changes.ref,
    repository,
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
          commit,
          ref: tag,
        };
      })
  );
}

/**
 *
 * @param {alerts.GitTagData[]} tags include the last tag from the previous run
 * @param {string} repositoryId
 */
async function getDiffFromTags(tags, repositoryId) {
  let [previousTag] = tags;
  const [, ...newTags] = tags;

  /** @type {(alerts.AlertChanges)[]}  */
  const allChanges = [];

  const fileFilter = getFileFilter(repositoryId);
  const diffProcessor = getDiffProcessor(repositoryId);

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

    const changes = await diffProcessor(
      repositoryId,
      tag,
      files,
      prevTree,
      currTree
    );
    if (changes.length > 0) {
      allChanges.push(...changes);
    }
    previousTag = tag;
  }
  return allChanges;
}

async function main() {
  const sources = await getSources();

  const results = [];
  for (const source of sources) {
    const repo = await openRepo(source);
    const tags = await getNewerTagsFromRepo(repo, source.tag);
    const [lastTag] = tags.slice(-1);
    if (!lastTag) {
      throw new Error(`Error: last tag not found for ${source.repository}`);
    }
    const diffs = await getDiffFromTags(tags, source.repository);
    results.push({
      changes: diffs,
      newRef: lastTag.ref,
      repository: source.repository,
    });
  }

  if (process.env.DUMP) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const result of results) {
      if (result.changes.length === 0) {
        console.log(`no update for ${result.repository}`);
      } else {
        const inserts = await batchPromises(
          result.changes,
          (diff) => insertAlert(result.repository, diff),
          5
        );
        const fullfilledInserts = /**@type {{status:"fulfilled", value:alerts.Alert}[]} */ (inserts.filter(
          ({ status }) => status === "fulfilled"
        ));
        const rejectedInsert = inserts.filter(
          ({ status }) => status === "rejected"
        );
        fullfilledInserts.forEach((insert) => {
          const { ref, repository, info } = insert.value;
          console.log(
            `insert alert for ${ref} on ${repository} (${info.file})`
          );
        });

        rejectedInsert.length &&
          console.error(
            `${rejectedInsert.length} alerts failed to insert in ${result.repository}`
          );
      }

      // const update = await updateSource(result.repository, result.newRef);
      // console.log(`update source ${update.repository} to ${update.tag}`);
    }
  }
}

main().catch(console.error);
