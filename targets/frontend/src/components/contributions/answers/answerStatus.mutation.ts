import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

export const contributionAnswerUpdateStatusMutation = `
mutation contributionAnswerUpdate($id: uuid!, $status: statustype!, $userId: uuid!) {
  insert_contribution_answer_statuses_one(object: {status: $status, user_id: $userId, answer_id: $id}) {
    id
    created_at
  }
}
`;

export type MutationProps = Pick<Answer, "id"> & {
  status: string;
  userId: string;
};

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useContributionAnswerUpdateStatusMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(
    contributionAnswerUpdateStatusMutation
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
