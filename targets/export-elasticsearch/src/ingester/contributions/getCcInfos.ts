import {
  AgreementDoc,
  ContributionConventionnelInfos,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";

export const getCcInfos = (
  ccns: DocumentElasticWithSource<AgreementDoc>[],
  contribution: DocumentElasticWithSource<ContributionDocumentJson>
): ContributionConventionnelInfos => {
  const cc = ccns.find((v) => v.num === parseInt(contribution.idcc));
  if (!cc) {
    throw new Error(`Contribution ${contribution.idcc} not found`);
  }
  return {
    ccnSlug: cc.slug,
    ccnShortTitle: cc.shortTitle,
  };
};
