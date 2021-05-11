import { KaliArticleHDN } from "@shared/types";
import {
  Agreement,
  AgreementArticle,
  AgreementArticleData,
  AgreementArticleWithParentSections,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import find from "unist-util-find";
import parents, {
  NodeWithParent,
  NodeWithParentChild,
} from "unist-util-parents";

import { createSorter } from ".";

/**
 * @returns {ingester.AgreementArticleByBlock[]}
 */
export function getKaliArticlesByTheme(
  allBlocks: KaliArticleHDN[],
  agreementTree: Agreement
) {
  const conventionBlocks = allBlocks.find(
    (blocks) => blocks.id === agreementTree.data.id
  );
  const treeWithParents = parents(agreementTree.children);
  if (!conventionBlocks) {
    return [];
  }
  const { blocks } = conventionBlocks;
  return (
    (blocks &&
      Object.keys(blocks)
        .filter((key) => blocks[key].length > 0)
        .sort(createSorter((a) => parseInt(a, 10)))
        .map((key) => ({
          articles:
            blocks[key] &&
            blocks[key].flatMap((articleId) => {
              const node = find(
                treeWithParents,
                (
                  node: NodeWithParentChild<AgreementSection, AgreementArticle>
                ) => node.data.id === articleId
              );
              if (!node) {
                console.error(
                  `${articleId} not found in idcc ${agreementTree.data.num}`
                );
              }
              return node
                ? [
                    {
                      cid: node.data.cid,
                      id: node.data.id,
                      section: node.parent.data.title,
                      title: node.data.num || "non numéroté",
                    },
                  ]
                : [];
            }),
          bloc: key,
        }))
        .filter(({ articles }) => articles.length > 0)) ||
    []
  );
}
