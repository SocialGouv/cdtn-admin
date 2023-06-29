import { useQuery } from "urql";

import { LegiArticle, LegiReference } from "../../type";
import { Result } from "./ReferenceInput";

export const contributionSearchLegiReferencesSearch = `
query SearchLegiReferences($query: String) {
  legiArticles: legi_articles(where: {label: {_ilike: $query}}, limit: 10) {
    cid
    id
    label
  }
}
`;

type QueryResult = {
  legiArticles: LegiArticle[];
};

export const useContributionSearchLegiReferenceQuery = (
  query: string | undefined
): Result<Pick<LegiReference, "legiArticle">> => {
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: contributionSearchLegiReferencesSearch,
    variables: {
      query: `%${query}%`,
    },
  });
  return {
    data:
      data?.legiArticles.map((legiArticle) => ({
        legiArticle,
      })) ?? [],
    error,
    fetching,
  };
};
