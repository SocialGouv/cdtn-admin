import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { fetchContributionsWithNoContent } from "./fetchContributionsWithNoContent";

export const getCcSupportedWithNoContent = async (
  genericContrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<string[]> => {
  return fetchContributionsWithNoContent(genericContrib.questionId);
};
