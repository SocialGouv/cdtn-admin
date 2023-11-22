import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { fetchMessageBlock } from "./fetchMessageBlock";

export const generateMessageBlock = async (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<string | undefined> => {
  if (!contrib.questionMessageId) {
    return undefined;
  }
  const messageBlock = await fetchMessageBlock(contrib.questionMessageId);
  if (contrib.contentType === "ANSWER") {
    return messageBlock.contentAgreement;
  } else if (
    contrib.contentType === "NOTHING" ||
    contrib.contentType === "CDT" ||
    contrib.contentType === "UNFAVOURABLE"
  ) {
    return messageBlock.contentLegal;
  } else if (contrib.contentType === "UNKNOWN") {
    return messageBlock.contentNotHandled;
  }
  throw new Error("Unknown content type");
};
