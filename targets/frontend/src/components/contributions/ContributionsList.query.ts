import { useQuery } from "urql";

import { Question } from "./type";

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
      display_mode,
      status,
      agreements {
        id,
        name
      }
    }
  }
}`;

type QueryResult = {
  contribution_questions: Question[];
  contribution_questions_aggregate: { aggregate: { count: number } };
};

export type ContributionListQueryProps = {
  idcc?: string;
  search?: string;
  pageInterval: number;
  page: number;
};

export type ContributionListQueryResult = {
  rows: Question[];
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
