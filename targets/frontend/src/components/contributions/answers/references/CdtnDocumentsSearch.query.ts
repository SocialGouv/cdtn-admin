import { useQuery } from "urql";

import { CdtnDocument } from "../../type";
import { Result } from "./ReferenceInput";

export const contributionSearchCdtnDocumentsSearch = `
query SearchCdtnDocuments($query: String, $sources: [String!]) {
  documents(where: {title: {_ilike: $query}, is_available: {_eq: true}, is_published: {_eq: true}, source: {_in: $sources}}, limit: 10) {
    title
    cdtn_id
    source
    slug
  }
}
`;

type QueryResult = {
  documents: CdtnDocument[];
};

export const useContributionSearchCdtnDocumentQuery = (
  query: string | undefined
): Result<CdtnDocument> => {
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: contributionSearchCdtnDocumentsSearch,
    variables: {
      query: `%${query}%`,
      sources: [
        "dossiers",
        "external",
        "page_fiche_ministere_travail",
        "information",
        "outils",
      ],
    },
  });
  return {
    data: data?.documents ?? [],
    error,
    fetching,
  };
};
