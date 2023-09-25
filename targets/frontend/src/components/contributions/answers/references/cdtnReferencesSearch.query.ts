import { useQuery } from "urql";

import { CdtnReference, Document } from "../../type";
import { Result } from "./ReferenceInput";

type QueryResult = {
  documents: Document[];
};

export const useContributionSearchCdtnReferencesQuery = (
  query: string | undefined
): Result<Pick<CdtnReference, "document">> => {
  const hrefWithoutQuery: string | undefined = query?.split("?")[0];
  const [slug] = hrefWithoutQuery?.split("/").reverse() ?? [""];
  const title = `%${slug
    ?.split(/[\ \-\,]/gm)
    ?.map((text) => text.normalize().replace(/[\u0300-\u036f]/g, ""))
    .join("%")}%`;
  const [{ data, fetching, error }] = useQuery<QueryResult>({
    query: `
    query SearchCdtnReferences($sources: [String!], $slug: String, $title: String) {
      documents(where: {
        _or: [{
          title: {_ilike: $title}
        }, {
          slug: {_eq: $slug}
        }],
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
      title,
    },
  });
  return {
    data: data?.documents.map((document) => ({ document })) ?? [],
    error,
    fetching,
  };
};
