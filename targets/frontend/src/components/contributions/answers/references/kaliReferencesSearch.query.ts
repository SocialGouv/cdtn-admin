import { useQuery } from "urql";

import { KaliReference } from "../../type";
import { Result } from "./ReferenceInput";

export const contributionSearchKaliReferencesSearch = `
query SearchKaliReferences($idcc: bpchar!, $query: String!) {
  recentKaliReference(agreementId: $idcc, query: $query, limit: 5) {
    refs {
      agreementId
      cid
      id
      path
      label
    }
  }
}
`;

type QueryResult = {
  recentKaliReference: { refs: KaliReference[] };
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
      data: data?.recentKaliReference.refs ?? [],
      error,
      fetching,
    };
  };