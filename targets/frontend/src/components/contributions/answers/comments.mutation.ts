import { useMutation } from "@urql/next";

import { Comments } from "../type";

export const insertCommentMutation = `
mutation contributionCommentInsert($answerId: uuid!, $content: String!, $userId: uuid!) {
  insert_contribution_answer_comments_one(object: {answer_id: $answerId, content: $content, user_id: $userId}) {
    __typename
  }
}
`;

export const deleteCommentMutation = `
mutation contributionCommentDelete($id: uuid!) {
  delete_contribution_answer_comments_by_pk(id: $id) {
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

export const useCommentsDelete = () => {
  const [, executeDelete] = useMutation(deleteCommentMutation);
  return executeDelete;
};
