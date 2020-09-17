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
  const indexFile = files.find((file) => /^data\/index\.json$/.test(file));
  /** @type {alerts.AstChanges} */
  const changes = {
    added: [],
    modified: [],
    removed: [],
  };

  const currList = /** @type {alerts.FicheVddIndex[]}*/ (await createToJson(
    "data/index.json"
  )(currTree));

  if (indexFile) {
    const toJson = createToJson(indexFile);
    const prevList = /** @type {alerts.FicheVddIndex[]}*/ (await toJson(
      prevTree
    ));

    changes.removed = prevList.filter(
      ({ id }) => currList.find((item) => item.id === id) === undefined
    );
    changes.added = currList.filter(
      ({ id }) => prevList.find((item) => item.id === id) === undefined
    );
  }

  changes.modified = await Promise.all(
    files
      .filter((file) => !/index\.json/.test(file))
      .map(async (file) => {
        const toAst = createToJson(file);
        const currAst = /** @type {alerts.FicheVdd}*/ (await toAst(currTree));
        return currList.find(({ id }) => id === currAst.id);
      })
  );
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
