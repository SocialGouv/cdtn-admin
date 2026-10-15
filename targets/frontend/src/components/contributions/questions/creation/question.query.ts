import { CombinedError, gql, useQuery } from "urql";
import { Message } from "../../type";
import { AgreementRow } from "../common/agreementTypes";

export const contributionQuestionCreationDataQuery = gql`
  query SelectQuestionCreationData {
    messages: contribution_question_messages {
      contentAgreement
      contentLegal
      contentNotHandled
      contentNotHandledWithoutLegal
      contentAgreementWithoutLegal
      id
      label
    }
    agreements: agreement_agreements(
      where: { isSupported: { _eq: true } }
      order_by: { name: asc }
    ) {
      id
      name
      unextended
    }
    maxOrder: contribution_questions(order_by: { order: desc }, limit: 1) {
      order
    }
  }
`;

type QueryOutput = {
  messages: Message[];
  agreements: AgreementRow[];
  maxOrder: [{ order: number }];
};

export type QueryResult = {
  messages: Message[];
  agreements: AgreementRow[];
  nextOrder: number;
};

type Result = {
  data?: QueryResult;
  error?: CombinedError;
  fetching: boolean;
};

export const useQuestionCreationDataQuery = (): Result => {
  const [{ data, error, fetching }] = useQuery<QueryOutput>({
    query: contributionQuestionCreationDataQuery,
    requestPolicy: "cache-and-network",
  });

  let formattedData: Result["data"] = undefined;
  if (data) {
    formattedData = {
      messages: data.messages,
      agreements: data.agreements,
      nextOrder: data.maxOrder[0].order + 1,
    };
  }
  return {
    data: formattedData,
    fetching,
    error,
  };
};
