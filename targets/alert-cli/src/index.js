import { client } from "@shared/graphql-client";
import nodegit from "nodegit";
import semver from "semver";

import { batchPromises } from "./batchPromises";
import { ccns } from "./ccn-list.js";
import { processDilaDiff } from "./diff/dila";
import { processTravailDataDiff } from "./diff/fiches-travail-data";
import { processVddDiff } from "./diff/fiches-vdd";
import { exportContributionAlerts } from "./exportContributionAlerts";
import { getFicheServicePublicIds } from "./getFicheServicePublicIds";
import { getFilename } from "./node-git.helpers";
import { openRepo } from "./openRepo";

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
 * @param {string[]} ficheVddIDs
 * @returns { alerts.fileFilterFn }
 */
function getFileFilter(repository, ficheVddIDs) {
  switch (repository) {
    case "socialgouv/fiches-vdd":
      return (path) => {
        const matched = ["index.json", ...ficheVddIDs].some((id) =>
          new RegExp(`${id}.json$`).test(path)
        );
        return matched;
      };
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
 * @param {string[]} ficheVddIDs
 */
async function getDiffFromTags(tags, repositoryId, ficheVddIDs) {
  let [previousTag] = tags;
  const [, ...newTags] = tags;

  /** @type {(alerts.AlertChanges)[]}  */
  const allChanges = [];

  const fileFilter = getFileFilter(repositoryId, ficheVddIDs);
  const diffProcessor = getDiffProcessor(repositoryId);

  for (const tag of newTags) {
    console.log(
      `get diff from ${previousTag.ref} › ${tag.ref} for ${repositoryId}`
    );
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
      console.log(`› ${changes.length} changes found`);
      allChanges.push(...changes);
    }
    previousTag = tag;
  }
  return allChanges;
}

async function main() {
  const sources = await getSources();
  const ficheVddIDs = await getFicheServicePublicIds();
  const results = [];
  for (const source of sources) {
    const repo = await openRepo(source);
    const tags = await getNewerTagsFromRepo(repo, source.tag);
    const [lastTag] = tags.slice(-1);
    if (!lastTag) {
      throw new Error(`Error: last tag not found for ${source.repository}`);
    }
    const diffs = await getDiffFromTags(tags, source.repository, ficheVddIDs);
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
        // forward alert to contributions
        console.log(`››› ${result.repository}`);
        exportContributionAlerts(result);

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

        if (rejectedInsert.length) {
          console.error(
            `${rejectedInsert.length} alerts failed to insert in ${result.repository}`
          );
          process.exit(1);
        }
        const update = await updateSource(result.repository, result.newRef);
        console.log(`update source ${update.repository} to ${update.tag}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
