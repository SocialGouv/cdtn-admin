import { useQuery } from "urql";

import { CdtnReference } from "../../type";
import { Result } from "./ReferenceInput";

export const contributionSearchCdtnReferencesSearch = `
query SearchCdtnReferences($query: String, $sources: [String!]) {
  documents(where: {title: {_ilike: $query}, is_available: {_eq: true}, is_published: {_eq: true}, source: {_in: $sources}}, limit: 10) {
    title
    cdtn_id
    source
    slug
  }
}
`;

type QueryResult = {
  documents: CdtnReference[];
};

export const useContributionSearchCdtnReferencesQuery = (
  query: string | undefined
): Result<CdtnReference> => {
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: contributionSearchCdtnReferencesSearch,
    variables: {
      query: `%${query}%`,
      sources: [
        "dossiers",
        "external",
        "page_fiche_ministere_travail",
        "information",
        "outils",
        "modeles_de_courriers",
        "contributions",
      ],
    },
  });
  return {
    data: data?.documents ?? [],
    error,
    fetching,
  };
};
