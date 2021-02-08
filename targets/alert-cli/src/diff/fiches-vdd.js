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
 * @returns {Promise<alerts.VddAlertChanges[]>}
 */
export async function processVddDiff(
  repositoryId,
  tag,
  files,
  prevTree,
  currTree
) {
  /** @type {alerts.AstChanges} */
  const changes = {
    added: [],
    modified: [],
    removed: [],
  };

  const currList = /** @type {alerts.FicheVddIndex[]}*/ (await createToJson(
    "data/index.json"
  )(currTree));
  const prevList = /** @type {alerts.FicheVddIndex[]}*/ (await createToJson(
    "data/index.json"
  )(prevTree));

  changes.removed = prevList.filter(
    ({ id }) => currList.find((item) => item.id === id) === undefined
  );
  changes.added = currList.filter(
    ({ id }) => prevList.find((item) => item.id === id) === undefined
  );

  changes.modified = await Promise.all(
    files
      .filter((file) => !/index\.json/.test(file))
      .map(async (file) => {
        const previousJSON = /** @type {alerts.FicheVdd}*/ (await createToJson(
          file
        )(prevTree));
        const currentJSON = /** @type {alerts.FicheVdd}*/ (await createToJson(
          file
        )(currTree));

        if (!changes.added.includes(currentJSON.id) && previousJSON) {
          const previousText = getTextFromRawFiche(previousJSON);
          const currentText = getTextFromRawFiche(currentJSON);
          if (previousText !== currentText) {
            return {
              currentText,
              id: currentJSON.id,
              previousText,
              title: getTitleFromRawFiche(currentJSON),
            };
          }
        }
        return false;
      })
  );
  changes.modified = changes.modified.filter(Boolean);
  if (
    changes.added.length === 0 &&
    changes.modified.length === 0 &&
    changes.removed.length === 0
  ) {
    return [];
  }
  return [
    {
      date: tag.commit.date(),
      ref: tag.ref,
      title: "fiche service-public",
      type: "vdd",
      ...changes,
    },
  ];
}

/**
 *
 * @param {alerts.FicheVdd} fiche
 * @returns {string}
 */
const getTitleFromRawFiche = (fiche) => {
  const publication = fiche.children[0];

  return getText(getChild(publication, "dc:title"));
};

/**
 *
 * @param {alerts.FicheVdd} fiche
 * @returns {string}
 */
const getTextFromRawFiche = (fiche) => {
  const publication = fiche.children[0];

  // We filter out the elements we will never use nor display
  if (publication.children) {
    publication.children = publication.children.filter(
      (child) => child.name !== "OuSAdresser" && child.name !== "ServiceEnLigne"
    );
  }

  const intro = getText(getChild(publication, "Introduction"));
  const texte = getText(getChild(publication, "Texte"));
  const listeSituations = getText(getChild(publication, "ListeSituations"));
  const text = intro + " " + texte + " " + listeSituations;

  return text;
};

/**
 *
 * @param {alerts.FicheVddNode} element
 * @param {string} name
 * @returns {alerts.FicheVddNode | undefined}
 */
function getChild(element, name) {
  if (element.children) {
    return element.children.find((el) => el.name === name);
  }
}

/**
 * Beware, this one is recursive
 * @param {alerts.FicheVddNode | undefined} element
 * @returns {string}
 */
function getText(element) {
  if (!element) {
    return "";
  }
  if (element.type === "text" && element.text) {
    return element.text.trim();
  }
  if (element.children) {
    return element.children.map((child) => getText(child)).join(" ");
  }
  return "";
}
