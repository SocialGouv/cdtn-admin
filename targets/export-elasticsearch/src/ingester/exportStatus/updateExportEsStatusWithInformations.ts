import { gqlClient, logger } from "@shared/utils";
import { context } from "../context";

const updateExportEsStatusWithInformationsQuery = `
mutation updateOneExportEsStatus($id: uuid!, $informations: jsonb) {
  update_export_es_status_by_pk(pk_columns: {id: $id}, _set: {informations: $informations}) {
    id
  }
}
`;

const getExportEsStatusQuery = `
query getLatestExportStatus {
  export_es_status(where: {status: {_eq: "running"}}, order_by: {created_at: desc}) {
    id
  }
}
`;

interface HasuraReturn {
  update_export_es_status_by_pk: {
    id: string;
  };
}

export async function updateExportEsStatusWithInformations(
  informations: Record<string, any>
): Promise<string> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const latestExportEs = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(getExportEsStatusQuery, {
      informations,
    })
    .toPromise();

  if (latestExportEs.error || !latestExportEs.data) {
    logger.error(
      "Error",
      `Impossible de récupérer le dernier export qui tourne`,
      latestExportEs.error
    );
    throw latestExportEs.error;
  }

  const exportEsStatusId = latestExportEs.data.update_export_es_status_by_pk.id;

  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .mutation<HasuraReturn>(updateExportEsStatusWithInformationsQuery, {
      informations,
      id: exportEsStatusId,
    })
    .toPromise();
  if (res.error || !res.data) {
    logger.error(
      "Error",
      `Impossible de sauvegarder les informations supplémentaires liés à l'export avec l'id ${exportEsStatusId}`,
      res.error
    );
    throw res.error;
  }
  return res.data.update_export_es_status_by_pk.id;
}
