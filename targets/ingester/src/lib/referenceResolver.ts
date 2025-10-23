import type { TravailEmploiReference } from "@socialgouv/cdtn-types";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-utils";
import find from "unist-util-find";

type DilaNode =
  | KaliData.AgreementArticle
  | KaliData.AgreementSection
  | LegiData.CodeArticle
  | LegiData.CodeSection;

export type ReferenceResolver = (id: string | null) => DilaNode[];

export function createReferenceResolver(
  tree: KaliData.Agreement | LegiData.Code
): ReferenceResolver {
  return function resolveReference(id: string | null) {
    const article = find(tree, (node: DilaNode) => node.data.id === id);
    if (article === undefined) {
      return [];
    }
    return [article];
  };
}

export function articleToReference(
  node: KaliData.AgreementArticle | LegiData.CodeArticle
): TravailEmploiReference {
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
  return `https://legifrance.gouv.fr/codes/id/${id}`;
}

export function fixArticleNum(id: string, num = ""): string {
  if (/^annexe\s/i.test(num) && !num.includes("article")) {
    return `${num} ${id}`;
  }
  return num;
}
