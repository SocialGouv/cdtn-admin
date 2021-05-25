/* eslint-disable-next-line*/
import { FicheTravailEmploiDoc } from "@shared/types";
import type { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import type { ConvenientPatch, Tree } from "nodegit";
import { createToJson } from "../node-git.helpers";
import type { GitTagData } from "../types";

export type TravailDataAlertChanges = TravailDataChanges & {
  type: "travail-data";
  title: string;
  ref: string;
  date: Date;
};

export type TravailDataChanges = {
  added: FicheTravailEmploiInfo[];
  removed: FicheTravailEmploiInfo[];
  modified: FicheTravailEmploiInfoWithDiff[];
};

export type FicheTravailEmploiInfo = {
  pubId: string;
  title: string;
  url: string;
};

export type FicheTravailEmploiInfoWithDiff = FicheTravailEmploiInfo & {
  removedSections: SectionTextChange[];
  addedSections: SectionTextChange[];
  modifiedSections: SectionTextChange[];
};

type SectionTextChange = {
  title: string;
  currentText: string;
  previousText: string;
};

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
  //before 10march release, some documents has no pubId
  const toId = ({ pubId }: FicheTravailEmploi) => (pubId ? [pubId] : []);
  const previousIds = previousJson.flatMap(toId);
  const currentIds = currentJson.flatMap(toId);

  const added = currentJson.filter((doc) => !previousIds.includes(doc.pubId));
  const removed = previousJson.filter((doc) => !currentIds.includes(doc.pubId));

  const modified = currentJson.flatMap(
    (doc): FicheTravailEmploiInfoWithDiff[] => {
      const previousDoc = previousJson.find(
        (fiches) => doc.pubId === fiches.pubId
      );

      if (!previousDoc || !hasDocumentChanged(previousDoc, doc)) {
        return [];
      }

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
      const modifiedSections = doc.sections.filter(({ title }) =>
        addedSections.every(({ title: newTitle }) => title !== newTitle)
      );

      return [
        {
          addedSections: addedSections.map((section) => ({
            currentText: section.text,
            previousText: "",
            title: section.title,
          })),
          modifiedSections: modifiedSections.flatMap((section) => {
            const prevSection = previousDoc.sections.find(
              ({ title }) => title === section.title
            );
            if (prevSection && prevSection.text !== section.text) {
              return [
                {
                  currentText: section.text,
                  previousText: prevSection.text,
                  title: section.title,
                },
              ];
            }
            return [];
          }),
          pubId: doc.pubId,
          removedSections: removedSections.map((section) => ({
            currentText: "",
            previousText: section.text,
            title: section.title,
          })),
          title: doc.title,
          url: doc.url,
        },
      ];
    }
  );

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
