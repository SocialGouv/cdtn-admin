/* eslint-disable-next-line*/
import nodegit from "nodegit";
import { createToJson } from "../node-git.helpers";

/**
 *
 * @param {string} repositoryId
 * @param {alerts.GitTagData} tag
 * @param {nodegit.ConvenientPatch[]} patches
 * @param {nodegit.Tree} prevTree
 * @param {nodegit.Tree} currTree
 * @returns {Promise<alerts.VddAlertChanges[]>}
 */
export async function processVddDiff(
  repositoryId,
  tag,
  patches,
  prevTree,
  currTree
) {
  /** @type {alerts.AstChanges} */
  const changes = {
    added: [],
    modified: [],
    removed: [],
  };

  changes.removed = patches.flatMap((patch) =>
    patch.isDeleted() ? [toSimpleVddChange(patch)] : []
  );

  changes.added = patches.flatMap((patch) =>
    patch.isAdded() ? [toSimpleVddChange(patch)] : []
  );

  changes.modified = patches.flatMap((patch) =>
    patch.isModified() ? [toSimpleVddChange(patch)] : []
  );

  const modified = patches.flatMap((patch) =>
    patch.isModified() ? [patch.newFile().path()] : []
  );

  const particuliers = modified.filter((path) => /particuliers/.test(path));

  const professionnels = modified
    .filter((path) => /professionnels/.test(path))
    .filter((path) => {
      const id = path.match(/\w+.json$/);
      if (!id) {
        return false;
      }
      return particuliers.every((file) => !new RegExp(`${id[0]}$`).test(file));
    });

  const associations = modified
    .filter((path) => /associations/.test(path))
    .filter((path) => {
      const id = path.match(/\w+.json$/);
      if (!id) {
        return false;
      }
      return particuliers.every((file) => !new RegExp(`${id[0]}$`).test(file));
    })
    .filter((path) => {
      const id = path.match(/\w+.json$/);
      if (!id) {
        return false;
      }
      return professionnels.every(
        (file) => !new RegExp(`${id[0]}$`).test(file)
      );
    });

  const filterFiles = particuliers.concat(professionnels, associations);

  changes.modified = [];

  changes.modified = await Promise.all(
    filterFiles.map(async (fichePath) => {
      if (/index\.json/.test(fichePath)) return;
      if (
        changes.removed
          .concat(changes.added)
          .some((fiche) => `data/${fiche.type}/${fiche.id}.json` === fichePath)
      ) {
        return;
      }

      const toJson = createToJson(fichePath);
      const [
        previousJSON,
        currentJSON,
      ] = /** @type {alerts.FicheVdd[]}*/ await Promise.all(
        [prevTree, currTree].map(toJson)
      );
      const previousText = getTextFromRawFiche(previousJSON);
      const currentText = getTextFromRawFiche(currentJSON);
      if (previousText !== currentText) {
        return {
          currentText,
          id: currentJSON.id,
          previousText,
          title: getTitleFromRawFiche(currentJSON),
          type: fichePath.split("/")[1],
        };
      }
    })
  );
  // cannot flat map because of async;
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

/**
 *
 * @param {nodegit.ConvenientPatch} patch
 */
function toSimpleVddChange(patch) {
  const filepath = patch.newFile().path();
  const match = filepath.match(/(\w+)\/(\w+)\.json$/);
  if (!match) {
    throw new Error(`[toSimpleVddChange] Can't parse ${filepath}`);
  }
  return {
    id: match[2],
    type: match[1],
  };
}
