import {
  ContributionCompleteDoc,
  ContributionDocumentJson,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";

export function isNewContribution(
  obj: DocumentElasticWithSource<
    ContributionDocumentJson | ContributionCompleteDoc
  >
): obj is DocumentElasticWithSource<ContributionDocumentJson> {
  if ("type" in obj) return true;
  return false;
}

export const isOldContribution = (
  obj: DocumentElasticWithSource<
    ContributionDocumentJson | ContributionCompleteDoc
  >
): obj is DocumentElasticWithSource<ContributionCompleteDoc> => {
  if ("answers" in obj) return true;
  return false;
};

export const isGenericContribution = (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
) => {
  return contrib.idcc === "0000";
};
