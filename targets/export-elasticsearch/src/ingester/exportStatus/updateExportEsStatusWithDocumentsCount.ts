import { gqlClient, logger } from "@shared/utils";
import { context } from "../context";
import { ExportEsStatus } from "@socialgouv/cdtn-types";

const updateExportEsStatusQuery = `
mutation updateOneExportEsStatus($id: uuid!, $documentsCount: jsonb) {
  update_export_es_status_by_pk(pk_columns: {id: $id}, _set: {documentsCount: $documentsCount}) {
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

interface HasuraReturnMutation {
  update_export_es_status_by_pk: Pick<ExportEsStatus, "id">;
}

interface HasuraReturnQuery {
  export_es_status: Pick<ExportEsStatus, "id">[];
}

export async function updateExportEsStatusWithDocumentsCount(
  documentsCount: ExportEsStatus["documentsCount"]
): Promise<string> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const latestExportEs = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturnQuery>(getExportEsStatusQuery, {})
    .toPromise();

  if (latestExportEs.error || !latestExportEs.data) {
    logger.error(`Impossible de récupérer le dernier export qui tourne`);
    logger.error(latestExportEs.error);
    throw new Error(latestExportEs.error?.message);
  }

  const exportEsStatusId = latestExportEs.data.export_es_status[0].id;

  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .mutation<HasuraReturnMutation>(updateExportEsStatusQuery, {
      documentsCount,
      id: exportEsStatusId,
    })
    .toPromise();
  if (res.error || !res.data) {
    logger.error(
      `Impossible de sauvegarder les documentsCount supplémentaires liés à l'export avec l'id ${exportEsStatusId}`
    );
    logger.error(res.error);
    throw new Error(res.error?.message);
  }
  return exportEsStatusId;
}
