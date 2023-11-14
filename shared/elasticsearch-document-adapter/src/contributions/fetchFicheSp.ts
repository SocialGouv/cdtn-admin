import { FicheServicePublicDoc } from "@shared/types";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchFicheSpByCdtnId = `
  query fiche_sp_by_cdtn_id($cdtnId: String!) {
    documents(
      where: {
        cdtn_id: { _eq: $cdtnId }
        source: { _eq: "fiches_service_public" }
      }
    ) {
      document
    }
  }
`;

interface HasuraReturn {
  documents: {
    document: FicheServicePublicDoc;
  }[];
}

export async function fetchFicheSp(
  cdtnId: string
): Promise<FicheServicePublicDoc> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchFicheSpByCdtnId, {
      cdtnId,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data || res.error) {
    throw new Error(`Impossible de récupérer la fiche sp ${cdtnId}`);
  }
  if (res.data.documents.length !== 1) {
    throw new Error("Le nombre de fiche sp retourné est différent de 1");
  }
  const document = res.data.documents[0].document as FicheServicePublicDoc;
  if (!document) {
    throw new Error("Il n'y a pas de document dans la fiche sp");
  }
  return document;
}
