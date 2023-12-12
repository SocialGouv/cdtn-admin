import type { AgreementArticleWithPath } from "@socialgouv/kali-data";
import type { Agreement, IndexedArticle } from "@socialgouv/kali-data-types";

import { agreementArticlesWithPath } from "./agreement-articles-with-path";
import { KaliArticlesInput } from "./update-agreement-articles";

function getLastElement(path: string[]) {
  return path.length > 0 ? path[path.length - 1] : "";
}

export function getSection(path: string[]) {
  const lastElement = getLastElement(path);
  if (lastElement.includes("Article")) {
    return path[path.length - 2];
  }
  return lastElement;
}

function normalizeArticle(
  agreement_id: string,
  agreementArticleWithPath: AgreementArticleWithPath | undefined
): KaliArticlesInput {
  if (!agreementArticleWithPath) {
    throw new Error(`Failed to normalize article for ${agreement_id}`);
  }
  const {
    data: { cid, id },
  } = agreementArticleWithPath;
  const path = agreementArticleWithPath.path.join(" » ");

  return {
    agreement_id,
    cid,
    id,
    path,
    label: getLastElement(agreementArticleWithPath.path),
    section: getSection(agreementArticleWithPath.path),
  };
}

export async function loadAgreementArticles(
  kali_id: string,
  idcc: string,
  loadAgreement: (agreementId: string) => Promise<Agreement>,
  loadArticles: () => Promise<IndexedArticle[]>
): Promise<KaliArticlesInput[]> {
  const articlesWithPath = await agreementArticlesWithPath(
    kali_id,
    loadAgreement,
    loadArticles
  );
  return articlesWithPath.map((articleWithParentSections) =>
    normalizeArticle(idcc, articleWithParentSections)
  );
}
