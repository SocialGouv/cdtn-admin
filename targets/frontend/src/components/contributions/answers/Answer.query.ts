import { useQuery } from "urql";

import { Answer } from "../type";

export const contributionAnswerQuery = `query contribution_answer($questionId: uuid, $agreementId: bpchar) {
    contribution_answers(where: {
      _and: {
        question_id: {_eq: $questionId},
        agreement_id: {_eq: $agreementId}
      }
    }) {
      questionId: question_id
      agreementId: agreement_id
      content
      otherAnswer: other_answer
      status
      question {
        id
        content
      }
      agreement {
        id
        name
      }
    }
  }
  `;

type QueryProps = {
  questionId: string;
  agreementId: string;
};

type QueryResult = {
  contribution_answers: Answer[];
};

export const useContributionAnswerQuery = ({
  agreementId,
  questionId,
}: QueryProps): Answer | undefined => {
  const [result] = useQuery<QueryResult>({
    query: contributionAnswerQuery,
    requestPolicy: "cache-and-network",
    variables: {
      agreementId,
      questionId,
    },
  });
  if (
    !result?.data?.contribution_answers ||
    !result?.data?.contribution_answers?.length
  ) {
    return;
  }
  return result.data?.contribution_answers[0];
};
