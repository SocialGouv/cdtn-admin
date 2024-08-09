import { useQuery } from "urql";

import { Answer, Question } from "../type";
import { initStatus } from "../status/utils";

export const questionListQuery = `query questions_answers($search: String) {
  contribution_questions(
    where: {
      content: { _ilike: $search }
    },
    order_by: {order: asc}
  ) {
    id
    content
    order
    seo_title
    answers_aggregate(where: {cdtnId: {_is_null: false }}) {
      aggregate {
        count
      }
    }
  }
}`;
export type QueryQuestionAnswer = Answer;
export type QueryQuestion = Question & {
  answers_aggregate: {
    aggregate: {
      count: number;
    };
  };
};

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
  if (result.error) {
    console.error(result.error);
  }
  return {
    rows: result.data?.contribution_questions ?? [],
  };
};
