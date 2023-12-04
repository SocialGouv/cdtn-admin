import { AgreementDoc, ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { ContributionConventionnelInfos } from "./types";

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
