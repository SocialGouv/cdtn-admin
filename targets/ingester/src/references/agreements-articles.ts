import type { AgreementArticleWithPath } from "@socialgouv/kali-data";
import parents from "unist-util-parents";

import { insertKaliReference } from "../lib/hasura-mutations-queries";
import { loadAgreement } from "../transform/agreements/data-loaders";
import getAgreementArticlesWithPath from "../transform/agreements/getAgreementArticlesWithPath";
import convertHtmlToPlainText from "./convertHtmlToPlainText";

function normalizeArticle(
  agreementId: string,
  agreementArticleWithPath: AgreementArticleWithPath
) {
  const {
    data: { cid, id, num },
  } = agreementArticleWithPath;
  const containerId = agreementId;
  const content = convertHtmlToPlainText(agreementArticleWithPath.data.content);
  const index = num !== undefined ? num : "";
  const path = agreementArticleWithPath.path.join(" » ");

  return {
    cid,
    containerId,
    content,
    id,
    index,
    path,
  };
}

const getAgreement = async (agreementId: string) => {
  const agreementTree = await loadAgreement(agreementId);
  return parents(agreementTree);
};

export default async function updateAgreementsArticles(
  id: string
): Promise<void> {
  const agreementCacheKey = `AGREEMENT:${id}`;
  const agreement = await getAgreement(id);

  await insertKaliReference(agreementCacheKey, agreement);

  const agreementId = agreement.data.id;
  const articlesCacheKey = `AGREEMENT:${agreementId}:ARTICLES`;

  const articlesWithPath = await getAgreementArticlesWithPath(agreementId);
  const articles = articlesWithPath.map((articleWithParentSections: any) =>
    normalizeArticle(agreementId, articleWithParentSections)
  );
  await insertKaliReference(articlesCacheKey, articles);
}
