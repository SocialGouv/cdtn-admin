import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { fetchMessageBlock } from "./fetchMessageBlock";

export const generateMessageBlock = async (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<string> => {
  const messageBlock = await fetchMessageBlock(contrib.questionId);
  if (
    contrib.idcc === "0000" || // Generic answer
    contrib.contentType === "UNKNOWN" ||
    contrib.contentType === "CDT" ||
    contrib.contentType === "UNFAVOURABLE"
  ) {
    return messageBlock.contentLegal;
  } else if (contrib.contentType === "ANSWER" || contrib.contentType === "SP") {
    return messageBlock.contentAgreement;
  } else if (contrib.contentType === "NOTHING") {
    return messageBlock.contentNotHandled;
  }
  throw new Error("Unknown content type");
};
