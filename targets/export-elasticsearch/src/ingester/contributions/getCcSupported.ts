import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";

export const getCcSupported = (
  allContributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  genericContrib: DocumentElasticWithSource<ContributionDocumentJson>
): string[] => {
  return allContributions
    .filter((v) => v.questionIndex === genericContrib.questionIndex)
    .map((v) => v.idcc);
};
