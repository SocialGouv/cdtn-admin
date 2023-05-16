import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

export const contributionAnswerUpdateMutation = `
mutation contributionAnswerUpdate($id: uuid!, $content:String, $otherAnswer: String, $status: statustype!, $userId: uuid!) {
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
    insert_contribution_answer_statuses_one(object:{status:$status, user_id:$userId,answer_id:$id}) {
      id, created_at
    }
  }
`;

export type MutationProps = Omit<
  Answer,
  | "question"
  | "agreement"
  | "answer_comments"
  | "questionId"
  | "agreementId"
  | "statuses"
> & {
  status: string;
  userId: string;
};

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useContributionAnswerUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateMutation
  );
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate(data);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
