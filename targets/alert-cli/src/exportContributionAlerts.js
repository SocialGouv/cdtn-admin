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
        value: nodes.find((node) => node.data.cid === reference.dila_cid),
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
