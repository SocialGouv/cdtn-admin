import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
  ExportEsStatus,
} from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";
import { fetchLastExportStatus } from "../documents/fetchLastExportStatus";

export const fetchContributionDocumentsQuery = `
query fetchContributions {
    documents(where: {source: {_eq: "contributions"}}) {
      cdtnId: cdtn_id
      contribution {
        id
        statuses(where:{status: {_eq: "TO_PUBLISH"}}, order_by: {created_at: desc}, limit: 1) {
          status
          createdAt: created_at
        }
      }
    }
  }
`;

interface HasuraReturn {
  documents: [DocumentElasticWithSource<ContributionDocumentJson>] | undefined;
}

export function filterContributionDocumentsToPublish(
  latestExportEs: Partial<ExportEsStatus> | undefined,
  contributionDocs:
    | DocumentElasticWithSource<ContributionDocumentJson>[]
    | undefined
): DocumentElasticWithSource<ContributionDocumentJson>[] | undefined {
  return contributionDocs?.filter((doc) => {
    const exportDate = latestExportEs?.created_at
      ? new Date(latestExportEs.created_at).getTime()
      : 0;
    const statusDate = doc.contribution?.statuses?.length
      ? new Date(doc.contribution.statuses[0].createdAt).getTime()
      : 0;
    return statusDate > exportDate;
  });
}

export async function fetchContributionDocumentToPublish(
  isProd: boolean
): Promise<DocumentElasticWithSource<ContributionDocumentJson>[] | undefined> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchContributionDocumentsQuery, {})
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  const exportEsStatus = await fetchLastExportStatus(isProd);

  return filterContributionDocumentsToPublish(
    exportEsStatus,
    res.data?.documents
  );
}
