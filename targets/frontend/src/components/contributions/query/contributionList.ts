import { Question } from "../type";

export type ContributionListResult = {
  contribution_questions: Question[];
  contribution_questions_aggregate: { aggregate: { count: number } };
};

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
        content,
        status,
        agreements {
          id,
          name
        }
      }
    }
  }`;
