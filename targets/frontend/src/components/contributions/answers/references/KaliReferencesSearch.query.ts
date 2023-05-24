import { CombinedError, useQuery } from "urql";

import { KaliReference } from "../../type";

export const contributionSearchKaliReferencesSearch = `
query SearchKaliReferences($idcc: bpchar, $query: String) {
  kali_articles(where: {agreement_id: {_eq: $idcc}, _and: {path: {_ilike: $query}}}, limit: 5) {
    agreement_id
    cid
    id
    path
  }
}
`;

type QueryProps = {
  idcc: string;
  query: string | undefined;
};

type QueryResult = {
  kali_articles: KaliReference[];
};

export type Result = {
  data: KaliReference[];
  fetching: boolean;
  error: CombinedError | undefined;
};

export const useContributionSearchKaliReferenceQuery = ({
  query,
  idcc,
}: QueryProps): Result => {
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: contributionSearchKaliReferencesSearch,
    variables: {
      idcc,
      query: `%${query}%`,
    },
  });
  return {
    data: data?.kali_articles ?? [],
    error,
    fetching,
  };
};
