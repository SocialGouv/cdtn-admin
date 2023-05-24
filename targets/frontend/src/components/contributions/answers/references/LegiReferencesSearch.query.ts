import { CombinedError, useQuery } from "urql";

import { LegiReference } from "../../type";

export const contributionSearchLegiReferencesSearch = `
query SearchLegiReferences($query: String) {
  legi_articles(where: {index: {_ilike: $query}}) {
    cid
    id
    index
  }
}
`;

type QueryProps = {
  query: string | undefined;
};

type QueryResult = {
  legi_articles: LegiReference[];
};

export type Result = {
  data: LegiReference[];
  fetching: boolean;
  error: CombinedError | undefined;
};

export const useContributionSearchLegiReferenceQuery = ({
  query,
}: QueryProps): Result => {
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
