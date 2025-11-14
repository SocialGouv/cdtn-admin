import { gqlClient, logger } from "@shared/utils";
import { context } from "../context";
import { LinkedContent } from "@socialgouv/cdtn-types/build/elastic/related-items";

const fetchLinkedContentById = `
query get_linked_document($cdtnId: String!) {
  documents(where: {cdtn_id: {_eq: $cdtnId}, is_available: {_eq: true}, is_published: {_eq: true}}) {
    slug
    source
    title
  }
}

`;

interface HasuraReturn {
  documents: LinkedContent[];
}

export async function fetchLinkedContent(
  cdtnId: string,
  logDetails: string
): Promise<LinkedContent | undefined> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
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
      `Impossible de récupérer la contenu lié avec l'id ${cdtnId} (${logDetails})`,
      res.error
    );
    throw res.error;
  }
  if (!res.data?.documents.length) {
    logger.info(`Warning: Pas de contenu lié ${cdtnId}, (${logDetails})`);
    return;
  }
  return res.data.documents[0];
}
