import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { fetchMessageBlock } from "./fetchMessageBlock";

export const generateMessageBlock = async (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<string> => {
  //TODO: normalement c'est pas possible
  if (!contrib.questionId) {
    throw new Error(
      `Missing questionId, for this contribution : ${JSON.stringify(contrib)}`
    );
  }
  const messageBlock = await fetchMessageBlock(contrib.questionId);
  if (contrib.contentType === "ANSWER") {
    return messageBlock.contentAgreement;
  } else if (
    contrib.contentType === "NOTHING" ||
    contrib.contentType === "CDT" ||
    contrib.contentType === "UNFAVOURABLE" ||
    contrib.contentType === "SP"
  ) {
    return messageBlock.contentLegal;
  } else if (contrib.contentType === "UNKNOWN") {
    return messageBlock.contentNotHandled;
  }
  throw new Error("Unknown content type");
};
