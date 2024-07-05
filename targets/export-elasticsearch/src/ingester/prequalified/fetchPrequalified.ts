import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchPrequalifiedQuery = `
query fetch_prequalified {
  search_prequalified {
      id
      title
      variants
      documents(order_by: {order: asc}, where: {document: {_and: {is_published: { _eq: true }, is_searchable: { _eq: true }, is_available: { _eq: true }} }}) {
        document {
          id: initial_id
          cdtnId: cdtn_id
          title
          slug
          source
          text
          isPublished: is_published
          isSearchable: is_searchable
          description: meta_description
          documentDescription: document(path: "$.description")
          url: document(path: "$.url")
          action: document(path: "$.action")
        }
      }
    }
}
`;

export interface FetchedPrequalified {
  id: string;
  title: string;
  variants: string[];
  documents: {
    document: {
      id: string;
      cdtnId: string;
      title: string;
      slug: string;
      source: string;
      text: string;
      isPublished: boolean;
      isSearchable: boolean;
      description: string;
      documentDescription: string;
      url?: string;
      action?: string;
    };
  }[];
}

interface HasuraReturn {
  search_prequalified: FetchedPrequalified[] | undefined;
}

export async function fetchPrequalified(): Promise<
  FetchedPrequalified[] | undefined
> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchPrequalifiedQuery, {})
    .toPromise();
  if (res.error) {
    throw res.error;
  }

  return res.data?.search_prequalified;
}
