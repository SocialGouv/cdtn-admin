import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { fetchMessageBlock } from "./fetchMessageBlock";
import { fetchAgreementMessage } from "./fetchAgreementMessage";

export const generateMessageBlock = async (
  contribGeneric:
    | DocumentElasticWithSource<ContributionDocumentJson>
    | undefined,
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<string | undefined> => {
  const agreementMessage = await fetchAgreementMessage(contrib.idcc);
  if (agreementMessage) {
    return agreementMessage;
  }
  const messageBlock = await fetchMessageBlock(contrib.questionId);
  if (!messageBlock) {
    return undefined;
  } else if (
    contrib.idcc === "0000" || // Generic answer
    contrib.contentType === "UNKNOWN"
  ) {
    return messageBlock.contentLegal;
  } else if (contrib.contentType === "ANSWER" || contrib.contentType === "SP") {
    if (
      contribGeneric?.contentType === "GENERIC_NO_CDT" &&
      messageBlock.contentAgreementWithoutLegal
    ) {
      return messageBlock.contentAgreementWithoutLegal;
    }
    return messageBlock.contentAgreement;
  } else if (
    contrib.contentType === "NOTHING" ||
    contrib.contentType === "CDT" ||
    contrib.contentType === "UNFAVOURABLE"
  ) {
    if (
      contribGeneric?.contentType === "GENERIC_NO_CDT" &&
      messageBlock.contentNotHandledWithoutLegal
    ) {
      return messageBlock.contentNotHandledWithoutLegal;
    }
    return messageBlock.contentNotHandled;
  }
  throw new Error("Unknown content type");
};
