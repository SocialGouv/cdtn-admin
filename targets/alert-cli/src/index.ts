import { client } from "@shared/graphql-client";
import type { AlertChanges, AlertInfo, HasuraAlert } from "@shared/types";
import memoizee from "memoizee";
import type { Repository } from "nodegit";
import { Object, Tag } from "nodegit";
import * as semver from "semver";

import { batchPromises } from "./batchPromises";
import { ccns } from "./ccn-list";
import { processDilaDataDiff } from "./diff/dila-data";
import { processTravailDataDiff } from "./diff/fiches-travail-data";
import { processVddDiff } from "./diff/fiches-vdd";
import { exportContributionAlerts } from "./exportContributionAlerts";
import { getFicheServicePublicIds as _getFicheServicePublicIds } from "./getFicheServicePublicIds";
import { openRepo } from "./openRepo";
import type { GitTagData, Source } from "./types";

export * from "./types";

const sourcesQuery = `
query getSources {
  sources(order_by: {label: asc}) {
    repository
    tag
  }
}
`;
type SourceResult = {
  sources: {
    repository: string;
    tag: string;
  }[];
};

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

type InsertAlertData = {
  alert: {
    repository: string;
    ref: string;
    info: AlertInfo;
  };
};

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

type UpdateSourceResult = {
  source: {
    repository: string;
    tag: string;
  };
};

const getFicheServicePublicIds = memoizee(_getFicheServicePublicIds, {
  promise: true,
});

async function getFileFilter(
  repository: string
): Promise<(path: string) => boolean> {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (path: string) => path.endsWith("LEGITEXT000006072050.json");
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (path: string) =>
        ccns.some((ccn) => new RegExp(ccn.id).test(path));
    case "socialgouv/fiches-vdd": {
      /** @type {string[]} */
      const ficheVddIDs = await getFicheServicePublicIds();
      return (path: string) => {
        const matched = ficheVddIDs.some((id) =>
          new RegExp(`${id}.json$`).test(path)
        );
        return matched;
      };
    }
    case "socialgouv/fiches-travail-data":
      return (path) => path.endsWith("fiches-travail.json");
    default:
      return () => false;
  }
}

function getDiffProcessor(repository: string) {
  switch (repository) {
    case "socialgouv/legi-data":
    case "socialgouv/kali-data":
      return processDilaDataDiff;
    case "socialgouv/fiches-vdd":
      return processVddDiff;
    case "socialgouv/fiches-travail-data":
      return processTravailDataDiff;
    default:
      return async () => Promise.resolve([]);
  }
}

async function getSources(): Promise<Source[]> {
  const result = await client.query<SourceResult>(sourcesQuery).toPromise();
  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error("getSources");
  }
  return result.data.sources;
}

function getAlertInfo(change: AlertChanges): AlertInfo {
  if (change.type === "dila") {
    return {
      file: change.file,
      id: change.id,
      num: change.num,
      title: change.title,
      type: change.type,
    };
  }
  return {
    title: change.title,
    type: change.type,
  };
}

export async function insertAlert(
  repository: string,
  changes: AlertChanges
): Promise<Pick<HasuraAlert, "info" | "ref" | "repository">> {
  const alert: Pick<
    HasuraAlert,
    "changes" | "created_at" | "info" | "ref" | "repository"
  > = {
    changes,
    created_at: changes.date,
    info: getAlertInfo(changes),
    ref: changes.ref,
    repository,
  };

  const result = await client
    .mutation<InsertAlertData>(insertAlertsMutation, { alert })
    .toPromise();
  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error("insertAlert");
  }
  return result.data.alert;
}

export async function updateSource(
  repository: string,
  tag: string
): Promise<Source> {
  const result = await client
    .mutation<UpdateSourceResult>(updateSourceMutation, {
      repository,
      tag,
    })
    .toPromise();

  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error("updateSource");
  }
  return result.data.source;
}

async function getNewerTagsFromRepo(
  repository: Repository,
  lastTag: string
): Promise<GitTagData[]> {
  const tags: string[] = await Tag.list(repository);
  return Promise.all(
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
        const targetRef = await reference.peel(Object.TYPE.COMMIT);
        const commit = await repository.getCommit(targetRef.id());
        return {
          commit,
          ref: tag,
        };
      })
  );
}

async function getAlertChangesFromTags(
  repository: string,
  currentTag: GitTagData,
  previousTag: GitTagData
): Promise<AlertChanges[]> {
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

  const filterPatches = patches.filter((patch) =>
    fileFilter(patch.newFile().path())
  );

  return diffProcessor(
    repository,
    currentTag,
    filterPatches,
    prevTree,
    currTree
  );
}

async function saveAlertChanges(
  repository: string,
  alertChanges: AlertChanges[]
) {
  const inserts = await batchPromises(
    alertChanges,
    async (diff) => insertAlert(repository, diff),
    5
  );
  inserts.forEach((insert) => {
    if (insert.status === "fulfilled") {
      const { ref, repository: repo, info } = insert.value;
      console.log(
        `insert alert for ${ref} on ${repo} ${
          info.type === "dila" ? `(${info.file})` : ""
        })`
      );
    }
  });

  const rejectedInsert = inserts.filter(({ status }) => status === "rejected");

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

    const [lastTag = ""] = tags.slice(-1);
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
    if (newTags.length > 0) {
      const update = await updateSource(source.repository, lastTag.ref);
      console.log(`update source ${update.repository} to ${update.tag}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
