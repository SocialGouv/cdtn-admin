import fetch from "node-fetch";

export function exportContributionAlerts(
  repository: string,
  lastTag: alerts.GitTagData,
  alertChanges: alerts.AlertChanges[]
); void {
  
  if (!process.env.CONTRIBUTIONS_ENDPOINT) {
    console.info(
      "[exportContributionAlerts] skip sending alert to conributions endpoint"
    );
    return;
  }
  const dilaAlertChanges = /** @type {alerts.DilaAlertChanges[]} */ (alertChanges.filter(
    (change) => change.type === "dila"
  ));
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
          ({ data: { cid } }) => reference.dila_cid === cid
        );
        if (!modifiedNode) {
          return [];
        }
        return {
          answer_id: contrib.id,
          dila_cid: reference.dila_cid,
          dila_container_id: reference.dila_container_id,
          dila_id: reference.dila_id,
          value: computeDiff(reference, modifiedNode),
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
        const err = new Error(response.statusText);
        // @ts-expect-error
        err.status = response.status;
        return Promise.reject(err);
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

/**
 *
 * @param {import("@shared/types").ParseDilaReference} reference
 * @param {alerts.DilaNodeForDiff} modifiedNode
 */
function computeDiff(reference, modifiedNode) {
  const textFieldname = /^KALITEXT\d+$/.test(
    modifiedNode.context.containerId || ""
  )
    ? "content"
    : "texte";
  const content = modifiedNode.data[textFieldname] || "";

  const previousContent =
    (modifiedNode.previous && modifiedNode.previous.data[textFieldname]) || "";
  const showDiff = content !== previousContent;
  const showNotaDiff =
    modifiedNode.previous.data.nota !== modifiedNode.data.nota;
  const texts = [];
  if (showDiff) {
    texts.push({ current: content, previous: previousContent });
  }

  if (showNotaDiff) {
    texts.push({
      current: modifiedNode.data.nota,
      previous: modifiedNode.previous.data.nota,
    });
  }

  return {
    etat: {
      current: modifiedNode.data.etat,
      previous: modifiedNode.previous.data.etat,
    },
    texts,
  };
}
