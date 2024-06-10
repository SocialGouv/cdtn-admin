import {
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";

export const fetchContributionDocumentsQuery = `
query fetchContributions {
    documents(where: {source: {_eq: "contributions"}}) {
      cdtnId: cdtn_id
      export {
        createdAt: created_at
      }
      contribution {
        id
        updatedAt: updated_at
        statuses(where:{status: {_eq: "PUBLISHED"}}, order_by: {created_at: desc}, limit: 1) {
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
  contributionDocs:
    | DocumentElasticWithSource<ContributionDocumentJson>[]
    | undefined
): DocumentElasticWithSource<ContributionDocumentJson>[] | undefined {
  return contributionDocs?.filter((doc) => {
    const exportDate = doc.export?.createdAt
      ? new Date(doc.export.createdAt).getTime()
      : 0;
    const statusDate = doc.contribution?.statuses?.length
      ? new Date(doc.contribution.statuses[0].createdAt).getTime()
      : 0;
    return statusDate > exportDate;
  });
}

export async function fetchContributionDocumentToPublish(): Promise<
  DocumentElasticWithSource<ContributionDocumentJson>[] | undefined
> {
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
  return filterContributionDocumentsToPublish(res.data?.documents);
}
