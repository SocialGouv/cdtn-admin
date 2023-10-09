import { OperationResult, useMutation } from "urql";

import { Comments } from "../type";

export const insertCommentMutation = `
mutation contributionCommentInsert($answerId: uuid!, $content: String!, $userId: uuid!) {
  insert_contribution_answer_comments_one(object: {answer_id: $answerId, content: $content, user_id: $userId}) {
    __typename
  }
}
`;

export type MutationProps = Omit<
  Comments,
  "user" | "answer" | "id" | "createdAt"
>;

export const useCommentsInsert = () => {
  const [, executeUpdate] = useMutation<MutationProps>(insertCommentMutation);
  return executeUpdate;
};
