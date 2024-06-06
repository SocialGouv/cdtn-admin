import { Export } from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";

export const fetchLastExportStatusQuery = `
    query lastExportStatus {
        exportEsStatus: export_es_status(order_by: {created_at: desc}, limit: 1) {
            id
        }
    }
  `;

interface HasuraReturn {
    exportEsStatus: [Export] | undefined
}


export async function fetchLastExportStatus(): Promise<Export | undefined> {
    const HASURA_GRAPHQL_ENDPOINT =
        context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
    const HASURA_GRAPHQL_ENDPOINT_SECRET =
        context.get("cdtnAdminEndpointSecret") || "admin1";
    const res = await gqlClient({
        graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
        adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
    })
        .query<HasuraReturn>(fetchLastExportStatusQuery, {})
        .toPromise();
    if (res.error) {
        throw res.error;
    }
    return res.data?.exportEsStatus?.[0];
}
