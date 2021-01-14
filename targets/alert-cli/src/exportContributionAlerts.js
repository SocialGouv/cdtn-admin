import fetch from "node-fetch";

export const contribApiUrl =
  "https://contributions-api.codedutravail.fabrique.social.gouv.fr/alerts";

/**
 *
 * @param {alerts.AlertChanges[]} changes
 */
export async function exportContributionAlerts(changes) {
  const dilaAlertChanges = /** @type {alerts.DilaAlertChanges[]} */ (changes.filter(
    (change) => change.type === "dila"
  ));
  const contributions = dilaAlertChanges.flatMap((alert) => {
    const targetedContribs = alert.documents.filter(
      (targetDoc) => targetDoc.document.source == "contributions"
    );
    if (targetedContribs.length === 0) {
      return [];
    }
    return targetedContribs.flatMap(({ references, document: contrib }) => {
      return references.map((reference) => ({
        answer_id: contrib.id,
        dila_cid: reference.dila_cid,
        dila_container_id: reference.dila_container_id,
        dila_id: reference.dila_id,
        value: computeDiff(reference, alert),
        version: alert.ref,
      }));
    });
  });
  console.log(`Sending ${contributions} contrib alert(s) to contribution api`);
  await fetch(contribApiUrl, {
    body: JSON.stringify(contributions),
    headers: {
      "Content-Type": "application/json",
      Prefer: "merge-duplicates",
    },
    method: "POST",
  });
}

/**
 *
 * @param {import("@shared/types").ParseDilaReference} reference
 * @param {alerts.DilaAlertChanges} nodes
 */
function computeDiff(reference, { modified }) {
  const modifiedNode = modified.find(
    (node) => node.data.cid === reference.dila_cid
  );

  const textFieldname = /^KALITEXT\d+$/.test(modifiedNode.context.containerId)
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
