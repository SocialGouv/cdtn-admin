import { client } from "@shared/graphql-client";
import memoizee from "memoizee";
import nodegit from "nodegit";
import semver from "semver";

import { batchPromises } from "./batchPromises";
import { ccns } from "./ccn-list.js";
import { processDilaDiff } from "./diff/dila";
import { processTravailDataDiff } from "./diff/fiches-travail-data";
import { processVddDiff } from "./diff/fiches-vdd";
import { exportContributionAlerts } from "./exportContributionAlerts";
import { getFicheServicePublicIds as _getFicheServicePublicIds } from "./getFicheServicePublicIds";
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

const getFicheServicePublicIds = memoizee(_getFicheServicePublicIds, {
  promise: true,
});

/**
 *
 * @param { string } repository
 * @returns { Promise<alerts.fileFilterFn> }
 */
async function getFileFilter(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (path) => /LEGITEXT000006072050\.json$/.test(path);
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (path) => ccns.some((ccn) => new RegExp(ccn.id).test(path));
    case "socialgouv/fiches-vdd": {
      const ficheVddIDs = await getFicheServicePublicIds();
      return (path) => {
        const matched = ["index.json", ...ficheVddIDs].some((id) =>
          new RegExp(`${id}.json$`).test(path)
        );
        return matched;
      };
    }
    case "socialgouv/fiches-travail-data":
      return (path) => /fiches-travail\.json$/.test(path);
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
 * @param {string} repository
 * @param {alerts.GitTagData} currentTag first tag to compute diff (most recent)
 * @param {alerts.GitTagData} previousTag second tag to compute diff (least recent)
 * @returns {Promise<alerts.AlertChanges[]>}
 */
async function getAlertChangesFromTags(repository, currentTag, previousTag) {
  const fileFilter = await getFileFilter(repository);
  const diffProcessor = getDiffProcessor(repository);

  const currentCommit = currentTag.commit;
  const previousCommit = previousTag.commit;
  const [prevTree, currTree] = await Promise.all([
    previousCommit.getTree(),
    currentCommit.getTree(),
  ]);
  const diff = await currTree.diff(prevTree);
  const patches = await diff.patches();

  const files = patches.map(getFilename).filter(fileFilter);

  return diffProcessor(repository, currentTag, files, prevTree, currTree);
}

/**
 *
 * @param {string} repository
 * @param {alerts.AlertChanges[]} alertChanges
 */
async function saveAlertChanges(repository, alertChanges) {
  const inserts = await batchPromises(
    alertChanges,
    (diff) => insertAlert(repository, diff),
    5
  );
  const fullfilledInserts = /**@type {{status:"fulfilled", value:alerts.Alert}[]} */ (inserts.filter(
    ({ status }) => status === "fulfilled"
  ));
  const rejectedInsert = inserts.filter(({ status }) => status === "rejected");
  fullfilledInserts.forEach((insert) => {
    const { ref, repository, info } = insert.value;
    console.log(`insert alert for ${ref} on ${repository} (${info.file})`);
  });

  if (rejectedInsert.length) {
    console.error(
      `${rejectedInsert.length} alerts failed to insert in ${repository}`
    );
    process.exit(1);
  }
}

async function main() {
  const sources = await getSources();
  for (const source of sources) {
    const repo = await openRepo(source);
    const tags = await getNewerTagsFromRepo(repo, source.tag);

    const [lastTag] = tags.slice(-1);
    if (!lastTag) {
      throw new Error(`Error: last tag not found for ${source.repository}`);
    }

    let [previousTag] = tags;
    const [, ...newTags] = tags;
    for (const tag of newTags) {
      console.log(
        `get diff from ${previousTag.ref} › ${tag.ref} for ${source.repository}`
      );

      const alertChanges = await getAlertChangesFromTags(
        source.repository,
        tag,
        previousTag
      );
      console.log(`› ${alertChanges.length} changes found`);
      if (alertChanges.length > 0) {
        exportContributionAlerts(source.repository, lastTag, alertChanges);
        await saveAlertChanges(source.repository, alertChanges);
      }
      previousTag = tag;
    }
    const update = await updateSource(source.repository, lastTag.ref);
    console.log(`update source ${update.repository} to ${update.tag}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
