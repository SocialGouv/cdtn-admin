import { useQuery } from "@urql/next";

import { CdtnReference, Document } from "../../type";
import { Result } from "./ReferenceInput";

export type SearchCdtnReferencesQueryResult = {
  documents: Document[];
};

export const getNormalizedTitle = (title: string): string => {
  return `%${title
    ?.split(/[\ \-\,]/gm)
    ?.map((text) => text.normalize().replace(/[\u0300-\u036f]/g, ""))
    .join("%")}%`;
};

export const getSlugFromUrl = (query: string | undefined): string => {
  const hrefWithoutQuery: string | undefined = query?.split("?")[0];
  const [slug] = hrefWithoutQuery?.split("/").reverse() ?? [""];
  return slug;
};

export const SearchCdtnReferencesQuery = `
query SearchCdtnReferences($sources: [String!], $slug: String, $title: String, $slugRegex: String) {
  documents(where: {
    _or: [{
      title: {_ilike: $title}
    }, {
      slug: {_eq: $slug}
    }],
    slug: { _regex: $slugRegex },
    is_available: {_eq: true},
    is_published: {_eq: true},
    source: {_in: $sources}
  },
  order_by: {
    created_at: asc
  },
    limit: 10
    ) {
    title
    cdtnId: cdtn_id
    source
    slug
  }
}
`;

export const useContributionSearchCdtnReferencesQuery = (
  query: string | undefined,
  idcc?: string
): Result<Pick<CdtnReference, "document">> => {
  const slug = getSlugFromUrl(query);
  const title = getNormalizedTitle(slug);
  const slugRegex = `^(${idcc ? `${idcc}|` : ""}[^0-9])${
    idcc ? `{${idcc.length}}` : ""
  }[\-a-zA-Z0-9_]+$`;
  const [{ data, fetching, error }] = useQuery<SearchCdtnReferencesQueryResult>(
    {
      query: SearchCdtnReferencesQuery,
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
        title,
        slugRegex,
      },
    }
  );
  return {
    data: data?.documents.map((document) => ({ document })) ?? [],
    error,
    fetching,
  };
};
