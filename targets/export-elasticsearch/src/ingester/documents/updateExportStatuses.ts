import { fetchLastExportStatus } from "./fetchLastExportStatus";
import { gqlClient } from "@shared/utils";
import { context } from "../context";
import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";

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

export async function updateExportStatuses(
  contributionsToPublish: DocumentElasticWithSource<ContributionDocumentJson>[]
) {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const exportStatus = await fetchLastExportStatus();

  if (!exportStatus?.id) {
    return;
  }
  const cdtnIds = contributionsToPublish.map(
    (contribution) => contribution.cdtnId
  );
  const { id: exportId } = exportStatus;

  if (cdtnIds.length) {
    const res = await gqlClient({
      graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
      adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
    })
      .mutation(updateToLastExportStatusMutation, { cdtnIds, exportId })
      .toPromise();
    if (res.error) {
      throw res.error;
    }
  }
}
