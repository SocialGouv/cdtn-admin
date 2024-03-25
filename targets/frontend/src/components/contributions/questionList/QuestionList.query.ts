import { useQuery } from "@urql/next";

import { Answer, Question } from "../type";
import { initStatus } from "../status/utils";

export const questionListQuery = `query questions_answers($search: String) {
  contribution_questions(
    where: {
      content: { _ilike: $search }
    },
    order_by: {order: asc}
  ) {
    id,
    content,
    order,
    answers {
      statuses(order_by: {created_at: desc}, limit: 1) {
        status
        user {
          name
        }
      }
    }
  }
}`;
export type QueryQuestionAnswer = Answer;
export type QueryQuestion = Question;

export type QueryResult = {
  contribution_questions: QueryQuestion[];
};

export type QuestionListQueryProps = {
  search?: string;
};

export type QuestionListQueryResult = {
  rows: QueryQuestion[];
};

function formatAnswers(questions: QueryQuestion[] | undefined) {
  if (!questions) return [];

  return questions.map((question) => {
    question.answers = question?.answers?.map((answer) => ({
      ...answer,
      status: initStatus(answer as Answer),
    }));
    return question;
  });
}

export const useQuestionListQuery = ({
  search,
}: QuestionListQueryProps): QuestionListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: questionListQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search,
    },
  });
  return {
    rows: formatAnswers(result.data?.contribution_questions),
  };
};
