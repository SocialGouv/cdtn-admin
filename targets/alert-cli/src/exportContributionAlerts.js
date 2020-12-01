import fetch from "node-fetch";

const contribApi =
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
    const nodes = [...alert.modified, ...alert.removed, ...alert.added];
    return targetedContribs.flatMap(({ references, document: contrib }) => {
      return references.map((reference) => ({
        answer_id: contrib.id,
        cid: reference.dila_cid,
        id: reference.dila_id,
        value: computeDiff(
          nodes.find((node) => node.data.cid === reference.dila_cid)
        ),
        version: alert.ref,
      }));
    });
  });
  await fetch(contribApi, {
    body: JSON.stringify(contributions),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

/**
 *
 * @param {alerts.DilaNodeForDiff} node
 */
function computeDiff(node) {
  const textFieldname =
    node.context.containerId === "LEGITEXT000006072050" ? "texte" : "content";
  const content = node.data[textFieldname] || "";
  const previousContent =
    (node.previous && node.previous.data[textFieldname]) || "";
  const showDiff = content !== previousContent;
  const showNotaDiff = node.previous.data.nota !== node.data.nota;
  const texts = [];
  if (showDiff) {
    texts.push({ current: content, previous: previousContent });
  }

  if (showNotaDiff) {
    texts.push({
      current: node.data.nota,
      previous: node.previous.data.nota,
    });
  }

  return {
    etat: { current: node.data.etat, previous: node.previous.data.etat },
    texts,
  };
}
