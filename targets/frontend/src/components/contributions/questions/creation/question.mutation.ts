import { gql, useMutation } from "urql";

import { Answer, Question, Status } from "../../type";
import { MessageContentInput } from "../common/messageBlock";

const questionCreationMutation = gql`
  mutation CreateQuestion($question: contribution_questions_insert_input!) {
    insert_contribution_questions_one(object: $question) {
      id
    }
  }
`;

type MutationProps = {
  question: Pick<
    Question,
    | "content"
    | "seo_title"
    | "order"
    | "introduction_nothing"
    | "introduction_cdt"
    | "template_answer"
  > & {
    /** Ligne de message propre à la contribution, insérée avec la question */
    message?: { data: { label: string } & MessageContentInput };
    answers: {
      data: {
        display_date: Answer["displayDate"];
        agreement_id: Answer["agreementId"];
        content_type?: Answer["contentType"];
        content?: string;
        introduction?: string;
        legi_references?: { data: { article_id: string }[] };
        other_references?: { data: { label: string; url?: string }[] };
        statuses?: {
          data: { status: Status; user_id: string }[];
        };
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
