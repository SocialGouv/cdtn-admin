import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchLinkedContentById = `
query get_linked_document($cdtnId: String!) {
  documents_by_pk(cdtn_id: $cdtnId) {
    isPublished: is_published
    isAvailable: is_available
    slug
    source
    description: document(path: "description")
    title
    cdtnId: cdtn_id
  }
}
`;

interface HasuraReturn {
  documents_by_pk: LinkedContentLight | undefined;
}

export interface LinkedContentLight {
  cdtnId: string;
  title: string;
  slug: string;
  description: string | null;
  source: string;
  isPublished: boolean;
  isAvailable: boolean;
}

export async function fetchLinkedContent(
  cdtnId: string
): Promise<LinkedContentLight> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchLinkedContentById, {
      cdtnId: cdtnId,
    })
    .toPromise();
  if (res.error) {
    console.log(
      "Error",
      `Impossible de récupérer la contenu lié avec l'id ${cdtnId}`,
      res.error
    );
    throw res.error;
  }
  if (!res.data?.documents_by_pk) {
    console.log(
      "Error",
      `Impossible de récupérer la contenu lié avec l'id ${cdtnId}`
    );
    throw new Error(
      `Impossible de récupérer la contenu lié avec l'id ${cdtnId}`
    );
  }
  return res.data.documents_by_pk;
}
