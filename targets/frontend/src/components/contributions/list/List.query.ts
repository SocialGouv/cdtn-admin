import { useQuery } from "urql";

import { Answer, Question } from "../type";

export const contributionListQuery = `query questions_answers($search: String, $agreementId: bpchar, $offset: Int, $limit: Int) {
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
        agreement_id: {_eq: $agreementId}
      },
      order_by: {agreement_id: asc}
    ) {
      id,
      other_answer,
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
}`;
export type QueryQuestion = Pick<Question, "id" | "content"> & {
  answers: Pick<Answer, "id" | "otherAnswer" | "agreement" | "statuses">[];
};

export type QueryResult = {
  contribution_questions: QueryQuestion[];
  contribution_questions_aggregate: { aggregate: { count: number } };
};

export type ContributionListQueryProps = {
  agreementId?: string;
  search?: string;
  pageInterval: number;
  page: number;
};

export type ContributionListQueryResult = {
  rows: Partial<QueryQuestion>[];
  total: number;
};

export const useContributionListQuery = ({
  agreementId,
  search,
  pageInterval,
  page,
}: ContributionListQueryProps): ContributionListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: contributionListQuery,
    requestPolicy: "cache-and-network",
    variables: {
      agreementId,
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
