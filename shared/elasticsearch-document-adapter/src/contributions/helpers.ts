import {
  ContributionCompleteDoc,
  ContributionDocumentJson,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";

export const isNewContribution = (
  obj:
    | DocumentElasticWithSource<ContributionCompleteDoc>
    | DocumentElasticWithSource<ContributionDocumentJson>
): obj is DocumentElasticWithSource<ContributionDocumentJson> => {
  return "type" in obj;
};
