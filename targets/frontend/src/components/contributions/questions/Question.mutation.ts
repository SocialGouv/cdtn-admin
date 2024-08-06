import { OperationResult, useMutation } from "urql";

import { Question } from "../type";

export const questionUpdateMutation = `
mutation contributionQuestionUpdate($id: uuid!, $content: String, $message_id: uuid, $seo_title: String) {
  update_contribution_questions_by_pk(pk_columns: {id: $id}, _set: {content: $content, message_id: $message_id, seo_title: $seo_title}) {
    __typename
  }
}
`;

type MutationProps = Pick<
  Question,
  "id" | "content" | "message_id" | "seo_title"
>;

type MutationResult = (props: MutationProps) => Promise<OperationResult>;

export const useQuestionUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(questionUpdateMutation);
  return executeUpdate;
};
