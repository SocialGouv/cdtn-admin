import { gqlClient, logger } from "@shared/utils";
import { context } from "../context";

const fetchLinkedContentById = `
query get_linked_document($cdtnId: String!) {
  documents(where: {cdtn_id: {_eq: $cdtnId}, is_available: {_eq: true}, is_published: {_eq: true}}) {
    slug
    source
    description: document(path: "description")
    title
    cdtnId: cdtn_id
  }
}

`;

interface HasuraReturn {
  documents: LinkedContentLight[];
}

export interface LinkedContentLight {
  cdtnId: string;
  title: string;
  slug: string;
  description: string | null;
  source: string;
}

export async function fetchLinkedContent(
  cdtnId: string,
  questionIndex: number,
  idcc: string
): Promise<LinkedContentLight | undefined> {
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
      `Impossible de récupérer la contenu lié avec l'id ${cdtnId} (QR${questionIndex} - IDCC ${idcc})`,
      res.error
    );
    throw res.error;
  }
  if (!res.data?.documents.length) {
    logger.info(
      `Warning: Pas de contenu lié ${cdtnId}, voir QR${questionIndex} - IDCC ${idcc}`
    );
    return;
  }
  return res.data.documents[0];
}
