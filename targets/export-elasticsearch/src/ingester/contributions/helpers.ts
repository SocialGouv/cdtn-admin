import {
  ContributionContentType,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@shared/types";

export const isGenericContribution = (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
) => {
  return contrib.idcc === "0000";
};

export const isGenericNotCdtContribution = (
  contentType: ContributionContentType
) => {
  return contentType === "GENERIC_NO_CDT";
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
