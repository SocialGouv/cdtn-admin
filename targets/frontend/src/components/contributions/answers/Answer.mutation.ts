import { OperationResult, useMutation } from "urql";

import { Answer } from "../type";

export const contributionAnswerUpdateMutation = `
mutation contributionAnswerUpdate($id: uuid!, $content: String, $otherAnswer: String, $status: statustype!, $userId: uuid!, $references: [contribution_answer_references_insert_input!]!) {
  update_contribution_answers_by_pk(pk_columns: {id: $id}, _set: {content: $content, other_answer: $otherAnswer}) {
    __typename
  }
  insert_contribution_answer_statuses_one(object: {status: $status, user_id: $userId, answer_id: $id}) {
    id
    created_at
  }
  delete_contribution_answer_references(where: {answer_id: {_eq: $id}}) {
    affected_rows
  }
  insert_contribution_answer_references(objects: $references) {
    affected_rows
  }
}
`;

export type ReferenceProps = {
  answer_id: string;
  legi_reference_id?: string;
  kali_reference_id?: string;
  title?: string;
  url?: string;
};

export type MutationProps = Pick<Answer, "id" | "otherAnswer" | "content"> & {
  status: string;
  userId: string;
  references: ReferenceProps[];
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
