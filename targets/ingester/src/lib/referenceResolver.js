import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";
import find from "unist-util-find";
import parents from "unist-util-parents";

/**
 * @param { import("@socialgouv/legi-data").Code | import("@socialgouv/kali-data").Agreement} tree
 * @returns {(id:string) => (import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementArticle> )[]}
 */
export function referenceResolver(tree) {
  const treeWithParent = parents(tree);
  return function resolveReference(id) {
    const article = find(
      treeWithParent,
      (node) => node.type === "article" && node.data.id === id
    );
    if (!article) {
      return [];
    }
    return [article];
  };
}
// * @param {import("@socialgouv/legi-data").CodeSection | import("@socialgouv/legi-data").CodeArticle | import("@socialgouv/kali-data").AgreementSection | import("@socialgouv/kali-data").AgreementArticle} node
/**
 * @param {import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementArticle>} node
 * @returns {ingester.Reference}
 */
export function articletoReference(node) {
  return {
    id: node.data.id,
    title: `Article ${node.data.id} du code du travail`,
    type: getRouteBySource(SOURCES.CDT),
    url: `https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/${node.parent.data.id}/#${node.data.id}`,
  };
}
