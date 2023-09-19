import { useQuery } from "urql";

import { CdtnReference, Document } from "../../type";
import { Result } from "./ReferenceInput";

export const contributionSearchCdtnReferencesSearch = `
query SearchCdtnReferences($query: String, $sources: [String!]) {
  documents(where: {
    _or: [
      {slug: {_ilike: $query}},
      {title: {_ilike: $query}}
    ],
    is_available: {_eq: true},
    is_published: {_eq: true},
    source: {_in: $sources}
  },
  order_by: {slug: asc},
    limit: 10
    ) {
    title
    cdtnId: cdtn_id
    source
    slug
  }
}
`;

type QueryResult = {
  documents: Document[];
};

export const useContributionSearchCdtnReferencesQuery = (
  query: string | undefined
): Result<Pick<CdtnReference, "document">> => {
  const querySplit = query?.split(/[ -,]/);
  const slugQuery = querySplit?.map(
    (text) =>
      `{slug: {_ilike: "%${text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")}%"}}`
  ).join(`,
  `);
  const titleQuery = querySplit?.map(
    (text) =>
      `{title: {_ilike: "%${text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")}%"}}`
  ).join(`,
  `);
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: `
    query SearchCdtnReferences($sources: [String!]) {
      documents(where: {
        _or: [
          {_and: [${slugQuery}]}
          {_and: [${titleQuery}]}
        ],
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
    },
  });
  return {
    data: data?.documents.map((document) => ({ document })) ?? [],
    error,
    fetching,
  };
};
