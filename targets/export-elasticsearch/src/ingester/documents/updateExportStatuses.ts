import { fetchLastExportStatus } from "./fetchLastExportStatus";
import { gqlClient } from "@shared/utils";
import { context } from "../context";
import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";

const upsertDocumentExportMutation = `
mutation UpsertDocumentExports($objects: [document_exports_insert_input!]!) {
  insert_document_exports(
    objects: $objects,
    on_conflict: {
      constraint: document_exports_cdtn_id_key,  
      update_columns: [export_id]
    }
  ) {
    affected_rows
    returning {
      export_id
      cdtn_id
      id
    }
  }
}
`;

export async function updateExportStatuses(
  contributionsToPublish: DocumentElasticWithSource<ContributionDocumentJson>[]
) {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const exportStatus = await fetchLastExportStatus(true);

  if (!exportStatus?.id) {
    return;
  }
  const cdtnIds = contributionsToPublish.map(
    (contribution) => contribution.cdtnId
  );
  const { id: exportId } = exportStatus;

  const objectsToInsert = cdtnIds.map((cdtnId) => ({
    cdtn_id: cdtnId,
    export_id: exportId,
  }));

  try {
    const res = await gqlClient({
      graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
      adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
    })
      .mutation(upsertDocumentExportMutation, { objects: objectsToInsert })
      .toPromise();
    if (res.error) {
      throw res.error;
    }
  } catch (error) {
    console.error("Error updating export statuses:", error);
    throw error;
  }
}
