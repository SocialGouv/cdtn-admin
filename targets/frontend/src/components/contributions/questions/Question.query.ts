import { OperationContext, useQuery } from "urql";
import { initStatus } from "../status/utils";

import { Answer, Message, Question } from "../type";

export const contributionQuestionQuery = `
query SelectQuestion($questionId: uuid) {
  contribution_questions(where: {id: {_eq: $questionId}}) {
    content
    order
    id
    message {
      id
      label
      contentAgreement
      contentLegal
      contentNotHandled
    }
    answers(
      order_by: {agreement_id: asc}
    ) {
      id
      contentType: content_type
      agreement {
        id
        name
      }
      statuses(order_by: {created_at: desc}, limit: 1) {
        status
        user {
          name
        }
      }
    }
  }
  contribution_question_messages {
    contentAgreement
    contentLegal
    contentNotHandled
    id
    label
  }
}
`;

type QueryProps = {
  questionId: string;
};

type QueryOutput = {
  contribution_questions: Question[];
  contribution_question_messages: Message[];
};

export type QueryResult = {
  question: Question;
  messages: Message[];
  reExecute: (opts?: Partial<OperationContext> | undefined) => void;
};

export const useQuestionQuery = ({
  questionId,
}: QueryProps): QueryResult | undefined | "not_found" | "error" => {
  const [result, reExecute] = useQuery<QueryOutput>({
    query: contributionQuestionQuery,
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
  const answers =
    result.data.contribution_questions[0]?.answers?.map((answer) => ({
      ...answer,
      status: initStatus(answer as Answer),
    })) ?? [];
  const question = {
    ...result.data.contribution_questions[0],
    answers,
  };
  const messages = result.data.contribution_question_messages;
  return { messages, question, reExecute };
};
