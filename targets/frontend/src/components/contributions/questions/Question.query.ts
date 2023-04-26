import { useQuery } from "urql";

import { MessageEntity, QuestionEntity, QuestionWithMessages } from "./type";

export const contributionQuestionQuery = `
query SelectQuestion($questionId: uuid) {
  contribution_questions(where: {id: {_eq: $questionId}}) {
    content
    id
    message {
      id
      label
      content
    }
  }
  contribution_question_messages {
    content
    id
    label
  }
}
`;

type QueryProps = {
  questionId: string;
};

type QueryResult = {
  contribution_questions: QuestionEntity[];
  contribution_question_messages: MessageEntity[];
};

export const useQuestionQuery = ({
  questionId,
}: QueryProps): QuestionWithMessages | undefined | "not_found" | "error" => {
  const [result] = useQuery<QueryResult>({
    query: contributionQuestionQuery,
    requestPolicy: "cache-and-network",
    variables: {
      questionId,
    },
  });
  if (result?.error) {
    return "error";
  }
  if (!result?.data) {
    return;
  }
  if (
    !result?.data?.contribution_questions ||
    result?.data.contribution_questions?.length == 0
  ) {
    return "not_found";
  }
  const data = result.data.contribution_questions[0];
  return {
    messages: result.data.contribution_question_messages.map((message) => ({
      content: message.content,
      id: message.id,
      label: message.label,
    })),
    question: {
      content: data.content,
      id: data.id,
      message: data.message,
    },
  };
};
