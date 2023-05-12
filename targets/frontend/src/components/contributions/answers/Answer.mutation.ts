import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

export const contributionAnswerUpdateMutation = `
mutation contributionAnswerUpdate($id: uuid!, $content:String, $otherAnswer: String) {
    update_contribution_answers_by_pk(
      pk_columns: {
        id: $id
      }
      _set: {
        content: $content
        other_answer: $otherAnswer
      }
    ) {
        __typename
    }
  }
`;

export type MutationProps = Omit<
  Answer,
  "question" | "agreement" | "questionId" | "agreementId" | "statuses"
>;

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useContributionAnswerUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateMutation
  );
  return executeUpdate;
};
