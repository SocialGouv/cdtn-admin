import { FicheServicePublicDoc } from "@shared/types";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchFicheSpByCdtnId = `
  query fiche_sp_by_id($ficheSpId: String!) {
    documents(
      where: {
        initial_id: { _eq: $ficheSpId }
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
  ficheSpId: string
): Promise<FicheServicePublicDoc> {
  console.log("fetchFicheSp", ficheSpId);
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchFicheSpByCdtnId, {
      ficheSpId,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data || res.error) {
    throw new Error(`Impossible de récupérer la fiche sp ${ficheSpId}`);
  }
  if (res.data.documents.length !== 1) {
    throw new Error(
      `Le nombre de fiche sp retourné est différent de 1 pour l'id ${ficheSpId}`
    );
  }
  const document = res.data.documents[0].document as FicheServicePublicDoc;
  if (!document) {
    throw new Error("Il n'y a pas de document dans la fiche sp");
  }
  return document;
}
