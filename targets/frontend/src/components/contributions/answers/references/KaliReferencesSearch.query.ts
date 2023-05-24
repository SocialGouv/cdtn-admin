import { useQuery } from "urql";

import { KaliReference } from "../../type";
import { Result } from "./ReferenceInput";

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

type QueryResult = {
  kali_articles: KaliReference[];
};

export const useContributionSearchKaliReferenceQuery =
  (idcc: string) =>
  (query: string | undefined): Result<KaliReference> => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
