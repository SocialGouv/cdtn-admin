/* eslint-disable-next-line*/
import nodegit from "nodegit";
import { createToJson } from "../node-git.helpers";

/**
 *
 * @param {string} repositoryId
 * @param {alerts.GitTagData} tag
 * @param {string[]} files
 * @param {nodegit.Tree} prevTree
 * @param {nodegit.Tree} currTree
 * @returns {Promise<alerts.TravailDataAlertChanges[]>}
 */

export async function processTravailDataDiff(
  repositoryId,
  tag,
  files,
  prevTree,
  currTree
) {
  const fileChanges = await Promise.all(
    files.map(async (file) => {
      const toAst = createToJson(file);

      const [
        currAst,
        prevAst,
      ] = /** @type {import("@socialgouv/fiches-travail-data").FicheTravailEmploi[][]} */ (await Promise.all(
        [currTree, prevTree].map(toAst)
      ));
      return getChanges(prevAst, currAst);
    })
  );
  return fileChanges
    .filter(
      (file) =>
        file.modified.length > 0 ||
        file.removed.length > 0 ||
        file.added.length > 0
    )
    .map((change) => ({
      date: tag.commit.date(),
      ref: tag.ref,
      title: "fiche travail-emploi",
      type: "travail-data",
      ...change,
    }));
}

/**
 *
 * @param {import("@socialgouv/fiches-travail-data").FicheTravailEmploi[]} previousJson
 * @param {import("@socialgouv/fiches-travail-data").FicheTravailEmploi[]} currentJson
 * @return {alerts.TravailDataChanges}
 */
export function getChanges(previousJson, currentJson) {
  /** @type {(item: import("@socialgouv/fiches-travail-data").FicheTravailEmploi) => string } */
  const toId = ({ pubId }) => pubId;
  const previousIds = previousJson.map(toId);
  const currentIds = currentJson.map(toId);

  const added = currentJson.filter((doc) => !previousIds.includes(doc.pubId));
  const addedIds = added.map(toId);
  const removed = previousJson.filter((doc) => !currentIds.includes(doc.pubId));
  const modified = currentJson.flatMap((doc) => {
    const previousDoc = previousJson.find(
      (previousDoc) => doc.pubId === previousDoc.pubId && Boolean(doc.pubId)
      // Boolean(doc.pubId) ensure that we have a valid pubId since there was pubId===null
    );
    if (
      !addedIds.includes(doc.pubId) &&
      previousDoc &&
      hasDocumentChanged(previousDoc, doc)
    ) {
      previousDoc.sections[0];
      const removedSections = previousDoc.sections.filter(
        ({ title: prevTitle }) =>
          doc.sections.find(({ title }) => title === prevTitle) === undefined
      );
      const addedSections = doc.sections.filter(
        ({ title }) =>
          previousDoc.sections.find(
            ({ title: prevTitle }) => title === prevTitle
          ) === undefined
      );
      const sections = doc.sections.filter(({ title }) =>
        addedSections.every(({ title: newTitle }) => title !== newTitle)
      );
      return [
        {
          ...doc,
          ...(previousDoc.intro !== doc.intro && {
            previousIntro: previousDoc.intro,
          }),
          sections: [
            ...removedSections.map(({ text: previousText, ...section }) => ({
              ...section,
              previousText,
              text: "",
            })),
            ...sections.flatMap((section) => {
              const prevSection = previousDoc.sections.find(
                ({ title }) => title === section.title
              );
              if (prevSection && prevSection.text !== section.text) {
                return [{ ...section, previousText: prevSection.text }];
              }
              return [];
            }),
            ...addedSections.map((section) => ({
              ...section,
              previousText: "",
            })),
          ],
        },
      ];
    }
    return [];
  });

  return {
    added: added.map(({ pubId, title, url }) => ({ pubId, title, url })),
    modified,
    removed: removed.map(({ pubId, title, url }) => ({ pubId, title, url })),
  };
}

/**
 *
 * @param {import("@socialgouv/fiches-travail-data").FicheTravailEmploi} previousDocument
 * @param {import("@socialgouv/fiches-travail-data").FicheTravailEmploi} document
 */
function hasDocumentChanged(previousDocument, document) {
  return (
    document.intro !== previousDocument.intro ||
    previousDocument.sections.length !== document.sections.length ||
    document.sections.some((section, index) => {
      return (
        previousDocument.sections[index].text !== section.text ||
        previousDocument.sections[index].title !== section.title
      );
    })
  );
}
