import { gql, useMutation } from "urql";

import { Question } from "../../type";

export const questionUpdateMutation = gql`
  mutation contributionQuestionUpdate(
    $id: uuid!
    $content: String
    $message_id: uuid
    $seo_title: String
    $introduction_nothing: String
    $introduction_cdt: String
    $template_answer: String
  ) {
    update_contribution_questions_by_pk(
      pk_columns: { id: $id }
      _set: {
        content: $content
        message_id: $message_id
        seo_title: $seo_title
        introduction_nothing: $introduction_nothing
        introduction_cdt: $introduction_cdt
        template_answer: $template_answer
      }
    ) {
      __typename
    }
    updateDocsFromQuestion(questionId: $id) {
      count
    }
  }
`;

type MutationProps = Pick<
  Question,
  | "id"
  | "content"
  | "message_id"
  | "seo_title"
  | "introduction_nothing"
  | "introduction_cdt"
  | "template_answer"
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
  const resultFunction = async (data: MutationProps) => {
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
  return resultFunction;
};
