import type { KaliArticleHDN } from "@shared/types";
import type {
  Agreement,
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import find from "unist-util-find";
import type { NodeWithParentChild } from "unist-util-parents";
import parents from "unist-util-parents";

import { createSorter } from ".";

export function getKaliArticlesByTheme(
  allBlocks: KaliArticleHDN[],
  agreementTree: Agreement
): ingester.AgreementArticleByBlock[] {
  const conventionBlocks = allBlocks.find(
    (blocks) => blocks.id === agreementTree.data.id
  );
  if (!conventionBlocks) {
    return [];
  }
  const { blocks } = conventionBlocks;

  const treeWithParents = parents(agreementTree);

  return Object.keys(blocks)
    .sort(createSorter((a) => parseInt(a, 10)))
    .map((key) => ({
      articles: blocks[key].flatMap((articleId) => {
        const article = find(
          treeWithParents,
          (node: NodeWithParentChild<AgreementSection, AgreementArticle>) => {
            return node.data.id === articleId;
          }
        );
        if (article === undefined) {
          console.error(
            `${articleId} not found in idcc ${agreementTree.data.num}`
          );
          return [];
        }
        return [
          {
            cid: article.data.cid,
            id: article.data.id,
            section: article.parent.data.title,
            title: article.data.num ?? "non numéroté",
          },
        ];
      }),
      bloc: key,
    }))
    .filter(({ articles }) => articles.length > 0);
}
