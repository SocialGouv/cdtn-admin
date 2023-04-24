import { useQuery } from "urql";

import { Answer, Question } from "./type";

export const contributionListQuery = `query questions_answers($search: String, $idcc: bpchar, $offset: Int, $limit: Int) {
  contribution_questions_aggregate(
    where: {
      content: { _ilike: $search }
    }
  ) {
    aggregate {
      count
    }
  }
  contribution_questions(
    where: {
      content: { _ilike: $search }
    },
    offset: $offset,
    limit: $limit
  ) {
    id,
    content,
    answers(
      where: {
        id_cc: {_eq: $idcc}
      },
      order_by: {id_cc: asc}
    ) {
      other_answer,
      status,
      agreement {
        id
        name
      }
    }
  }
}`;

type QueryQuestion = Omit<Question, "answers"> & {
  answers: Omit<Answer, "idCc" | "idQuestion" | "question">[];
};

type QueryResult = {
  contribution_questions: QueryQuestion[];
  contribution_questions_aggregate: { aggregate: { count: number } };
};

export type ContributionListQueryProps = {
  idcc?: string;
  search?: string;
  pageInterval: number;
  page: number;
};

export type ContributionListQueryResult = {
  rows: Partial<QueryQuestion>[];
  total: number;
};

export const useContributionListQuery = ({
  idcc,
  search,
  pageInterval,
  page,
}: ContributionListQueryProps): ContributionListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: contributionListQuery,
    requestPolicy: "cache-and-network",
    variables: {
      idcc,
      limit: pageInterval,
      offset: page * pageInterval,
      search,
    },
  });
  return {
    rows: result.data?.contribution_questions ?? [],
    total: result?.data?.contribution_questions_aggregate.aggregate.count ?? 0,
  };
};
