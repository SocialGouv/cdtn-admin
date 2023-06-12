import { useQuery } from "urql";

import { Answer, Question } from "../type";
import { initStatus } from "../status/utils";

export const contributionListQuery = `query questions_answers($search: String) {
  contribution_questions(
    where: {
      content: { _ilike: $search }
    }
  ) {
    id,
    content,
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
export type QueryQuestionAnswer = Pick<Answer, "status">;
export type QueryQuestion = Pick<Question, "id" | "content"> & {
  answers: QueryQuestionAnswer[];
};

export type QueryResult = {
  contribution_questions: QueryQuestion[];
  contribution_questions_aggregate: { aggregate: { count: number } };
};

export type ContributionListQueryProps = {
  search?: string;
};

export type ContributionListQueryResult = {
  rows: QueryQuestion[];
};

function formatAnswers(questions: QueryQuestion[] | undefined) {
  if (!questions) return [];

  return questions.map((question) => {
    question.answers = question.answers.map((answer) => {
      answer.status = initStatus(answer);
      return answer;
    });
    return question;
  });
}

export const useContributionListQuery = ({
  search,
}: ContributionListQueryProps): ContributionListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: contributionListQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search,
    },
  });
  return {
    rows: formatAnswers(result.data?.contribution_questions),
  };
};
