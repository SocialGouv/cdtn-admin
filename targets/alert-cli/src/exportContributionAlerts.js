import fetch from "node-fetch";

export const contribApiUrl =
  "https://contributions-api.codedutravail.fabrique.social.gouv.fr/alerts";

/**
 *
 * @param {alerts.RepoAlert} alert
 */
export async function exportContributionAlerts(alert) {
  const dilaAlertChanges = /** @type {alerts.DilaAlertChanges[]} */ (alert.changes.filter(
    (change) => change.type === "dila"
  ));
  const contributions = dilaAlertChanges.flatMap((changes) => {
    console.log(
      `searching for contributions impacted by alert v${changes.ref} from ${alert.repository}`
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
        // @ts-ignore
        err.status = response.status;
        return Promise.reject(err);
      }
      console.info(
        `Sending ${contributions.length} contrib alert(s) to contributions (${contribApiUrl})`
      );
    })
    .catch((err) => {
      console.error(`Sending alerts fails`, err);
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
