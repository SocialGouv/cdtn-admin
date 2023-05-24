import { CombinedError, useQuery } from "urql";

import { CdtnDocument, LegiReference } from "../../type";

export const contributionSearchCdtnDocumentsSearch = `
query SearchCdtnDocuments($query: String) {
  documents(where: {title: {_ilike: $query}, is_available: {_eq: true}, is_published: {_eq: true}}, limit: 10) {
    title
    cdtn_id
    source
  }
}

`;

type QueryProps = {
  query: string | undefined;
};

type QueryResult = {
  documents: CdtnDocument[];
};

export type Result = {
  data: CdtnDocument[];
  fetching: boolean;
  error: CombinedError | undefined;
};

export const useContributionSearchCdtnDocumentQuery = ({
  query,
}: QueryProps): Result => {
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: contributionSearchCdtnDocumentsSearch,
    variables: {
      query: `%${query}%`,
    },
  });
  return {
    data: data?.documents ?? [],
    error,
    fetching,
  };
};
