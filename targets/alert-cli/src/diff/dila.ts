import { Agreement } from "@shared/types";
import type { ConvenientPatch, Tree } from "nodegit";

import { createToJson } from "../node-git.helpers";
import { getRelevantDocuments } from "../relevantContent";
import { compareArticles } from "./compareDilaTree";

function getFileComparator(repository: string) {
  switch (repository) {
    case "socialgouv/legi-data":
      // only code-du-travail
      return (art1: LegiData.CodeArticle, art2: LegiData.CodeArticle) =>
        art1.data.texte !== art2.data.texte ||
        art1.data.etat !== art2.data.etat ||
        art1.data.nota !== art2.data.nota;
    case "socialgouv/kali-data":
      // only a ccn matching our list
      return (
        art1: KaliData.AgreementArticle,
        art2: KaliData.AgreementArticle
      ) =>
        art1.data.content !== art2.data.content ||
        art1.data.etat !== art2.data.etat;
    default:
      return () => false;
  }
}

/**
 *
 * @returns {Promise<alerts.DilaAlertChanges[]>}
 */
export async function processDilaDiff(
  repositoryId: string,
  tag: alerts.GitTagData,
  patches: ConvenientPatch[],
  prevTree: Tree,
  currTree: Tree
) {
  const compareFn = getFileComparator(repositoryId);
  const fileChanges = await Promise.all(
    patches.map(async (patch) => {
      const file = patch.newFile().path();
      const toAst = createToJson<alerts.Agreement | LegiData.Code>(file);

      const [currAst, prevAst] = await Promise.all(
        [currTree, prevTree].map(toAst)
      );

      const changes = compareArticles(prevAst, currAst, compareFn);
      const documents = await getRelevantDocuments(changes);

      if (documents.length) {
        console.log(
          `[info] found ${documents.length} documents impacted by release v${
            tag.ref
          } on ${repositoryId},
           (idcc: ${
             currAst.type === "convention collective"
               ? currAst.data.num
               : currAst.data.id
           })`,
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
