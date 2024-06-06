import { DocumentElasticWithSource } from "@socialgouv/cdtn-types";
import {fetchContributionDocumentToPublish} from "../contributions";
import {fetchLastExportStatus} from "./fetchLastExportStatus";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

export const updateToLastExportStatusMutation = `mutation updateToLastExportStatus($cdtnIds: [String!], $exportId: uuid) {
  updateDocuments: update_documents(
    where: {cdtn_id: {_in: $cdtnIds}},
    _set: {
      exportId: $exportId
    }
  ) {
    returning {
      cdtn_id
    }
  }
}`;

export async function updateExportStatuses(): Promise<DocumentElasticWithSource<any> | undefined> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret") || "admin1";
  const exportStatus = await fetchLastExportStatus();
  console.log("exportStatus",exportStatus);
  const contributionsToPublish = await fetchContributionDocumentToPublish();
  console.log("contributionsToPublish",contributionsToPublish);

  if (!exportStatus?.id) {
    return;
  }
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
  .mutation(updateToLastExportStatusMutation, {
    cdtnIds: contributionsToPublish?.map((contribution) => contribution.cdtnId),
    exportId: exportStatus.id
  })
  .toPromise();
  if (res.error) {
      throw res.error;
  }

  return contributionsToPublish;
}
  