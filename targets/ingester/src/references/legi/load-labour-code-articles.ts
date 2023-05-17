import type { CodeArticle } from "@socialgouv/legi-data-types";
import unistUtilFlatFilter from "unist-util-flat-filter";
import parents from "unist-util-parents";

export type NormalizedArticle = {
  id: string;
  cid: string;
  index: string;
};

function convertCodeArticleToArticle(
  codeArticle: CodeArticle
): NormalizedArticle {
  const {
    data: { cid, id, num },
  } = codeArticle;
  const index = num;

  return {
    cid,
    id,
    index,
  };
}

export const loadLabourCodeArticles = async (
  loadCodeDuTravail: () => Promise<LegiData.Code>
): Promise<NormalizedArticle[]> => {
  const tree = await loadCodeDuTravail();
  const code = parents(tree);

  const codeArticles = unistUtilFlatFilter(code as any, {
    type: "article",
  });

  return codeArticles.children.map((codeArticle: CodeArticle) =>
    convertCodeArticleToArticle(codeArticle)
  );
};
