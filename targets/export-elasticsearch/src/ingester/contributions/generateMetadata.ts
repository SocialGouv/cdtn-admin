import {
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@shared/types";

export const generateMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>
): ContributionMetadata => {
  return {
    title: contribution.questionName,
    text: contribution.description, // champ qui est indexé par elasticsearch
  };
};
