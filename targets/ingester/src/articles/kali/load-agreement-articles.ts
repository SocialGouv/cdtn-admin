import type { AgreementArticleWithPath } from "@socialgouv/kali-data";
import type { Agreement, IndexedArticle } from "@socialgouv/kali-data-types";

import { agreementArticlesWithPath } from "./agreement-articles-with-path";

export type NormalizedArticle = {
  id: string;
  cid: string;
  agreement_id: string;
  path: string;
};

function normalizeArticle(
  agreement_id: string,
  agreementArticleWithPath: AgreementArticleWithPath | undefined
): NormalizedArticle {
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
  };
}

export async function loadAgreementArticles(
  kali_id: string,
  idcc: string,
  loadAgreement: (agreementId: string) => Promise<Agreement>,
  loadArticles: () => Promise<IndexedArticle[]>
): Promise<NormalizedArticle[]> {
  const articlesWithPath = await agreementArticlesWithPath(
    kali_id,
    loadAgreement,
    loadArticles
  );
  return articlesWithPath.map((articleWithParentSections) =>
    normalizeArticle(idcc, articleWithParentSections)
  );
}
