/* eslint-disable-next-line*/
import { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import type { ConvenientPatch, Tree } from "nodegit";
import { createToJson } from "../node-git.helpers";
import type {
  GitTagData,
  TravailDataAlertChanges,
  TravailDataChanges,
} from "../types";

export async function processTravailDataDiff(
  repositoryId: string,
  tag: GitTagData,
  patches: ConvenientPatch[],
  prevTree: Tree,
  currTree: Tree
): Promise<TravailDataAlertChanges[]> {
  const fileChanges = await Promise.all(
    patches.map(async (patch) => {
      const filename = patch.newFile().path();
      const toAst = createToJson<FicheTravailEmploi[]>(filename);

      const [currAst, prevAst] = await Promise.all(
        [currTree, prevTree].map(toAst)
      );
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

function getChanges(
  previousJson: FicheTravailEmploi[],
  currentJson: FicheTravailEmploi[]
): TravailDataChanges {
  const toId = ({ pubId }: FicheTravailEmploi) => pubId;
  const previousIds = previousJson.map(toId);
  const currentIds = currentJson.map(toId);

  const added = currentJson.filter(
    (doc) => Boolean(doc.pubId) && !previousIds.includes(doc.pubId)
  );
  const addedIds = added.map(toId);
  const removed = previousJson.filter(
    (doc) => Boolean(doc.pubId) && !currentIds.includes(doc.pubId)
  );
  const modified = currentJson.flatMap((doc) => {
    const previousDoc = previousJson.find(
      (fiches) => doc.pubId === fiches.pubId
    );
    if (
      !addedIds.includes(doc.pubId) &&
      previousDoc &&
      hasDocumentChanged(previousDoc, doc)
    ) {
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

function hasDocumentChanged(
  previousDocument: FicheTravailEmploi,
  document: FicheTravailEmploi
) {
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
