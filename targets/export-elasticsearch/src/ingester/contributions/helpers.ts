import {
  ContributionCompleteDoc,
  ContributionContentType,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@shared/types";

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

export const isReferencingGenericContribution = (
  contentType: ContributionContentType
) => {
  return (
    contentType === "CDT" ||
    contentType === "NOTHING" ||
    contentType === "UNFAVOURABLE"
  );
};
