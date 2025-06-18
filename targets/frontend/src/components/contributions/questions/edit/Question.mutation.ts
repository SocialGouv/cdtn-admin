import { gql, useMutation } from "urql";

import { Question } from "../../type";

export const questionUpdateMutation = gql`
  mutation contributionQuestionUpdate(
    $id: uuid!
    $content: String
    $message_id: uuid
    $seo_title: String
  ) {
    update_contribution_questions_by_pk(
      pk_columns: { id: $id }
      _set: {
        content: $content
        message_id: $message_id
        seo_title: $seo_title
      }
    ) {
      __typename
    }
    publishAll(questionId: $id, source: "contributions") {
      count
    }
  }
`;

type MutationProps = Pick<
  Question,
  "id" | "content" | "message_id" | "seo_title"
>;

type Result = {
  update_contribution_questions_by_pk: {
    __typename: string;
  };
};

export type MutationResult = (props: MutationProps) => Promise<Result>;

export const useQuestionUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<Result, MutationProps>(
    questionUpdateMutation
  );
  return async (data: MutationProps) => {
    const result = await executeUpdate(data);
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data) {
      throw new Error(
        "No data returned from 'useQuestionUpdateMutation' mutation"
      );
    }
    return result.data;
  };
};
