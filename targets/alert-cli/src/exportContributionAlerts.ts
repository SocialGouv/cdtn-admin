import fetch from "node-fetch";

import type { DilaModifiedNode } from "./diff/dila-data";
import type { AlertChanges, GitTagData } from "./types";

export function exportContributionAlerts(
  repository: string,
  lastTag: Pick<GitTagData, "ref">,
  alertChanges: AlertChanges[]
): void {
  if (!process.env.CONTRIBUTIONS_ENDPOINT) {
    console.info(
      "[exportContributionAlerts] skip sending alert to conributions endpoint"
    );
    return;
  }

  const dilaAlertChanges = alertChanges.flatMap((change) => {
    if (change.type === "dila") {
      return [change];
    }
    return [];
  });
  const contributions = dilaAlertChanges.flatMap((changes) => {
    console.log(
      `searching for contributions impacted by alert ${changes.ref} from ${repository}`
    );
    const targetedContribs = changes.documents.filter(
      ({ document }) => document.source == "contributions"
    );
    if (targetedContribs.length === 0) {
      return [];
    }
    return targetedContribs.flatMap(({ references, document: contrib }) => {
      return references.flatMap((reference) => {
        const modifiedNode = changes.modified.find(
          ({ cid }) => reference.dila_cid === cid
        );

        if (!modifiedNode) {
          return [];
        }

        return {
          answer_id: contrib.id,
          dila_cid: reference.dila_cid,
          dila_container_id: reference.dila_container_id,
          dila_id: reference.dila_id,
          value: computeDiff(modifiedNode),
          version: changes.ref,
        };
      });
    });
  });

  if (contributions.length === 0) {
    console.log(`Sending no alert for ${repository} (${lastTag.ref})`);
    return;
  }

  const contribApiUrl = `${process.env.CONTRIBUTIONS_ENDPOINT}/alerts`;

  fetch(contribApiUrl, {
    body: JSON.stringify(contributions),
    headers: {
      "Content-Type": "application/json",
      Prefer: "merge-duplicates",
    },
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        console.error(response.status, response.statusText);
        return Promise.reject(new Error(response.statusText));
      }
      console.info(
        `Sending ${contributions.length} alert(s) from ${repository} to ${contribApiUrl}`
      );
      console.debug(JSON.stringify(contributions));
    })
    .catch((err) => {
      console.error(
        `[FAIL] Sending ${contributions.length} alerts from ${repository} to ${contribApiUrl} fails`,
        err
      );
    });
}

function computeDiff(modifiedNode: DilaModifiedNode) {
  const etatUpdate = modifiedNode.diffs.find(({ type }) => type === "etat");
  const texts = modifiedNode.diffs.flatMap(
    ({ type, previousText: previous, currentText: current }) => {
      if (type === "etat") {
        return [];
      }
      return {
        current,
        previous,
      };
    }
  );
  return {
    etat: {
      current: etatUpdate ? etatUpdate.currentText : modifiedNode.etat,
      previous: etatUpdate ? etatUpdate.previousText : modifiedNode.etat,
    },
    texts,
  };
}
