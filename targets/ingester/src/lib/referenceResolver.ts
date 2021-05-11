import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import find from "unist-util-find";

type DilaNode =
  | LegiData.CodeArticle
  | LegiData.CodeSection
  | KaliData.AgreementSection
  | KaliData.AgreementArticle;

export type ReferenceResolver = (id: string) => DilaNode[];

export function createReferenceResolver(
  tree: LegiData.Code | KaliData.Agreement
): ReferenceResolver {
  return function resolveReference(id: string) {
    const article = find(tree, (node: DilaNode) => node.data.id === id);
    if (!article) {
      return [];
    }
    return [article];
  };
}

export function articleToReference(
  node: LegiData.CodeArticle | KaliData.AgreementArticle
) {
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

function getArticleUrl(id: string) {
  return `https://legifrance.gouv.fr/code/id/${id}`;
}

export function fixArticleNum(id: string, num = "") {
  if (num.match(/^annexe\s/i) && !num.includes("article")) {
    return `${num} ${id}`;
  }
  return num;
}
