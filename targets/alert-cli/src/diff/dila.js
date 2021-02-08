/* eslint-disable-next-line*/
import nodegit from "nodegit";

import { compareArticles } from "../compareTree.js";
import { createToJson } from "../node-git.helpers";
import { getRelevantDocuments } from "../relevantContent.js";

/**
 *
 * @param { string } repository
 * @returns { alerts.nodeComparatorFn<alerts.DilaNode> }
 */
function getFileComparator(repository) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (art1, art2) =>
        art1.data.texte !== art2.data.texte ||
        art1.data.etat !== art2.data.etat ||
        art1.data.nota !== art2.data.nota;
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (art1, art2) =>
        art1.data.content !== art2.data.content ||
        art1.data.etat !== art2.data.etat;
    default:
      return () => false;
  }
}

/**
 *
 * @param {string} repositoryId
 * @param {alerts.GitTagData} tag
 * @param {string[]} files
 * @param {nodegit.Tree} prevTree
 * @param {nodegit.Tree} currTree
 * @returns {Promise<alerts.DilaAlertChanges[]>}
 */
export async function processDilaDiff(
  repositoryId,
  tag,
  files,
  prevTree,
  currTree
) {
  const compareFn = getFileComparator(repositoryId);
  const fileChanges = await Promise.all(
    files.map(async (file) => {
      const toAst = createToJson(file);

      const [
        currAst,
        prevAst,
      ] = /** @type {alerts.DilaNode[]} */ (await Promise.all(
        [currTree, prevTree].map(toAst)
      ));

      const changes = compareArticles(prevAst, currAst, compareFn);
      const documents = await getRelevantDocuments(changes);
      if (documents.length) {
        console.log(
          `[info] found ${documents.length} documents impacted by release v${tag.ref} on ${repositoryId},
           (idcc: ${currAst.data.num})`,
          { file }
        );
      }
      return {
        ...changes,
        documents,
        file,
        id: currAst.data.id,
        num: currAst.data.num,
        title: currAst.data.title,
      };
    })
  );

  return fileChanges
    .filter(
      (file) =>
        file.modified.length > 0 ||
        file.removed.length > 0 ||
        file.added.length > 0 ||
        file.documents.length > 0
    )
    .map((change) => ({
      date: tag.commit.date(),
      ref: tag.ref,
      ...change,
      type: "dila",
    }));
}
