import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";
import { fetchLastExportStatus } from "../documents/fetchLastExportStatus";

export const fetchContributionDocumentsQuery = `
query fetchContributionsInDocuments($updated_at: timestamptz!) {
  documents(where: {
        updated_at: {_gte: $updated_at},
        source: {_eq: "contributions"}
      },
      order_by: {updated_at: desc}) {
        cdtnId: cdtn_id
        contribution {
          id
        }
      }
}
`;

interface HasuraReturn {
  documents: [DocumentElasticWithSource<ContributionDocumentJson>] | undefined;
}

export async function fetchContributionDocumentToPublish(
  isProd: boolean
): Promise<DocumentElasticWithSource<ContributionDocumentJson>[] | undefined> {
  const lastCompletedExportEsStatus = await fetchLastExportStatus(isProd, true);

  if (!lastCompletedExportEsStatus) {
    return [];
  }

  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchContributionDocumentsQuery, {
      updated_at: lastCompletedExportEsStatus.created_at,
    })
    .toPromise();

  if (res.error) {
    console.error(res.error);
    throw res.error;
  }

  return res.data?.documents;
}
