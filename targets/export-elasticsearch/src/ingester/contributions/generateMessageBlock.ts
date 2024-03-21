import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@shared/types";
import { fetchMessageBlock } from "./fetchMessageBlock";
import { fetchAgreementMessage } from "./fetchAgreementMessage";

export const generateMessageBlock = async (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<string | undefined> => {
  console.log(generateMessageBlock, JSON.stringify(contrib));
  const messageBlock = await fetchMessageBlock(contrib.questionId);
  if (!messageBlock) {
    return undefined;
  }
  const agreementMessage = await fetchAgreementMessage(contrib.idcc);
  if (agreementMessage) {
    return agreementMessage;
  } else if (
    contrib.idcc === "0000" || // Generic answer
    contrib.contentType === "UNKNOWN"
  ) {
    return messageBlock.contentLegal;
  } else if (contrib.contentType === "ANSWER" || contrib.contentType === "SP") {
    return messageBlock.contentAgreement;
  } else if (
    contrib.contentType === "NOTHING" ||
    contrib.contentType === "CDT" ||
    contrib.contentType === "UNFAVOURABLE"
  ) {
    return messageBlock.contentNotHandled;
  }
  throw new Error("Unknown content type");
};
