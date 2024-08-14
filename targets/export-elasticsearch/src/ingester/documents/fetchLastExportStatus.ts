import { Environment, ExportEsStatus } from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";
import {
  getLatestCompletedExportEsStatus,
  getLatestExportEsStatus,
} from "../../repositories/graphql";

export async function fetchLastExportStatus(
  isProd: boolean,
  isCompleted: boolean
): Promise<ExportEsStatus | undefined> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const resLatestExport = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<{ export_es_status: ExportEsStatus[] }>(
      isCompleted ? getLatestCompletedExportEsStatus : getLatestExportEsStatus,
      {
        environment: isProd
          ? Environment.production
          : Environment.preproduction,
      }
    )
    .toPromise();

  if (resLatestExport.error) {
    throw resLatestExport.error;
  }

  if (
    !resLatestExport.data?.export_es_status ||
    resLatestExport.data.export_es_status.length === 0
  ) {
    throw new Error("Failed to get, undefined object");
  }

  return resLatestExport.data.export_es_status[0];
}
