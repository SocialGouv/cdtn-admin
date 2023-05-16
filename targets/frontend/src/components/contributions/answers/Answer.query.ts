import { useQuery } from "urql";

import { Answer } from "../type";

export const contributionAnswerQuery = `query contribution_answer($id: uuid) {
    contribution_answers(where: {
        id: {_eq: $id},
    }) {
      id
      questionId: question_id
      agreementId: agreement_id
      content
      otherAnswer: other_answer
      question {
        id
        content
      }
      agreement {
        id
        name
      }
      answer_comments {
        id
        content
        createdAt: created_at
      }
      statuses(order_by: {created_at: desc}, limit: 1) {
        createdAt: created_at
        status
        user {
          name
        }
      }
    }
  }
  `;

type QueryProps = {
  id: string;
};

type QueryResult = {
  contribution_answers: Answer[];
};

export const useContributionAnswerQuery = ({
  id,
}: QueryProps): Answer | undefined => {
  const [result] = useQuery<QueryResult>({
    query: contributionAnswerQuery,
    variables: {
      id,
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
