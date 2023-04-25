import { OperationResult, useMutation } from "urql";

import { Answer } from "./type";

export const contributionAnswerUpdateMutation = `
mutation contributionAnswerUpdate($questionId: uuid!, $agreementId: bpchar!, $content:String, $otherAnswer: String, $status:String!) {
    update_contribution_answers_by_pk(
      pk_columns: {
        question_id: $questionId
        agreement_id: $agreementId
      }
      _set: {
        content: $content
        other_answer: $otherAnswer
        status: $status
      }
    ) {
        __typename
    }
  }
`;

type MutationProps = Omit<Answer, "question" | "agreement">;

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useContributionAnswerUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateMutation
  );
  return executeUpdate;
};
