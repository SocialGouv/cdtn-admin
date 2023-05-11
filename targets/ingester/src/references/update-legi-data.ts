import type { Article } from "@shared/dila-resolver/lib/types";
import type { CodeArticle } from "@socialgouv/legi-data-types";
import unistUtilFlatFilter from "unist-util-flat-filter";
import parents from "unist-util-parents";

import { insertLegiReference } from "../lib/hasura-mutations-queries";
import {
  CODE_DU_TRAVAIL_ID,
  loadCodeDuTravail,
} from "../transform/legi-data/data-loaders";

function convertCodeArticleToArticle(codeId: string, codeArticle: CodeArticle) {
  const {
    data: { cid, id, num, texte },
  } = codeArticle;
  const containerId = codeId;
  const content = texte;
  const index = num;
  const path = "";

  return {
    cid,
    containerId,
    content,
    id,
    index,
    path,
  };
}

const getCodeWithParents = async (): Promise<unknown> => {
  const tree = await loadCodeDuTravail();
  return parents(tree);
};
export default async function updateLegiData(): Promise<Article[]> {
  const codeCacheKey = `CODE:${CODE_DU_TRAVAIL_ID}`;

  const code = await getCodeWithParents();
  await insertLegiReference(codeCacheKey, code);

  const articlesCacheKey = `CODE:${CODE_DU_TRAVAIL_ID}:ARTICLES`;

  const codeArticles = unistUtilFlatFilter(code, {
    type: "article",
  });

  const articles = codeArticles.children.map((codeArticle: CodeArticle) =>
    convertCodeArticleToArticle(CODE_DU_TRAVAIL_ID, codeArticle)
  );
  console.log(`updateLegiData: Updating code for ID=${CODE_DU_TRAVAIL_ID}`);
  await insertLegiReference(articlesCacheKey, articles);

  return articles;
}
