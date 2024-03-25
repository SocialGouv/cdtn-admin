import { OperationResult, useMutation } from "@urql/next";

import { Question } from "../type";

export const questionUpdateMutation = `
mutation contributionQuestionUpdate($id: uuid!, $content: String, $message_id: uuid) {
  update_contribution_questions_by_pk(pk_columns: {id: $id}, _set: {content: $content, message_id: $message_id}) {
    __typename
  }
}
`;

type MutationProps = Pick<Question, "id" | "content" | "message_id">;

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useQuestionUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(questionUpdateMutation);
  return executeUpdate;
};
