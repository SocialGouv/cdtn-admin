import { useQuery } from "urql";

import { LegiReference } from "../../type";
import { Result } from "./ReferenceInput";

export const contributionSearchLegiReferencesSearch = `
query SearchLegiReferences($query: String) {
  legi_articles(where: {label: {_ilike: $query}}) {
    cid
    id
    label
  }
}
`;

type QueryResult = {
  legi_articles: LegiReference[];
};

export const useContributionSearchLegiReferenceQuery = (
  query: string | undefined
): Result<LegiReference> => {
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: contributionSearchLegiReferencesSearch,
    variables: {
      query: `%${query}%`,
    },
  });
  return {
    data: data?.legi_articles ?? [],
    error,
    fetching,
  };
};
