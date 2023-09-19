import { useQuery } from "urql";

import { CdtnReference, Document } from "../../type";
import { Result } from "./ReferenceInput";

type QueryResult = {
  documents: Document[];
};

export const useContributionSearchCdtnReferencesQuery = (
  query: string | undefined
): Result<Pick<CdtnReference, "document">> => {
  const [slug] = query?.split("/").reverse() ?? [""];
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: `
    query SearchCdtnReferences($sources: [String!], $slug: String) {
      documents(where: {
        slug: {_eq: $slug},
        is_available: {_eq: true},
        is_published: {_eq: true},
        source: {_in: $sources}},
        limit: 10
        ) {
        title
        cdtnId: cdtn_id
        source
        slug
      }
    }
    `,
    variables: {
      sources: [
        "dossiers",
        "external",
        "page_fiche_ministere_travail",
        "information",
        "outils",
        "modeles_de_courriers",
        "contributions",
        "fiches_service_public",
      ],
      slug,
    },
  });
  return {
    data: data?.documents.map((document) => ({ document })) ?? [],
    error,
    fetching,
  };
};
