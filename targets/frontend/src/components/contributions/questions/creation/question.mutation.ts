import { gql, useMutation } from "urql";

import { Answer, Question } from "../../type";

const questionCreationMutation = gql`
  mutation CreateQuestion($question: contribution_questions_insert_input!) {
    insert_contribution_questions_one(object: $question) {
      id
    }
  }
`;

type MutationProps = {
  question: Pick<Question, "content" | "message_id" | "seo_title" | "order"> & {
    answers: {
      data: {
        display_date: Answer["displayDate"];
        agreement_id: Answer["agreementId"];
        content_type?: Answer["contentType"];
      }[];
    };
  };
};

type Result = {
  insert_contribution_questions_one: {
    id: string;
  };
};

export type MutationResult = (
  props: MutationProps["question"]
) => Promise<Result>;

export const useQuestionCreationMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<Result, MutationProps>(
    questionCreationMutation
  );
  const resultFunction = async (question: MutationProps["question"]) => {
    const result = await executeUpdate({ question });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data) {
      throw new Error(
        "No data returned from 'useQuestionCreationMutation' mutation"
      );
    }
    return result.data;
  };
  return resultFunction;
};
