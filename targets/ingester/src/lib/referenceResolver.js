import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import find from "unist-util-find";

/**
 * @param { import("@socialgouv/legi-data-types").Code | import("@socialgouv/kali-data-types").Agreement} tree
 * @returns {ingester.referenceResolver}}
 */
export function referenceResolver(tree) {
  return function resolveReference(id) {
    const article = find(tree, (node) => node.data.id === id);
    if (!article) {
      return [];
    }
    return [article];
  };
}

/**
 * @param {import("@socialgouv/legi-data-types").CodeArticle | import("@socialgouv/kali-data-types").AgreementArticle} node
 * @returns {ingester.LegalReference}
 */
export function articleToReference(node) {
  const title = fixArticleNum(node.data.id, node.data.num);
  return {
    cid: node.data.cid,
    id: node.data.id,
    slug: slugify(title),
    title: title,
    type: SOURCES.CDT,
    url: getArticleUrl(node.data.id),
  };
}

/**
 *
 * @param {string} id
 */
function getArticleUrl(id) {
  return `https://legifrance.gouv.fr/code/id/${id}`;
}

/**
 *
 * @param {string} id
 * @param {string} num
 */
export function fixArticleNum(id, num = "") {
  if (num.match(/^annexe\s/i) && !num.includes("article")) {
    return `${num} ${id}`;
  }
  return num;
}
