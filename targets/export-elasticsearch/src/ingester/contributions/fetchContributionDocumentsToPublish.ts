import { ContributionDocumentJson, DocumentElasticWithSource } from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";

export const fetchContributionDocumentsQuery = `
query fetchContributions {
    documents(where: {source: {_eq: "contributions"}}) {
      cdtn_id
      export {
        created_at
      }
      contribution {
        id
        updated_at
        statuses(where:{status: {_eq: "PUBLISHED"}}, order_by: {created_at: desc}, limit: 1) {
          status
          created_at
        }
      }
    }
  }
  `;

interface HasuraReturn {
    documents: [DocumentElasticWithSource<ContributionDocumentJson>] | undefined
}

function filterDocumentToPublish(documents: DocumentElasticWithSource<any>[] | undefined): DocumentElasticWithSource<any>[] | undefined {
    return documents?.filter((doc) => {
        const exportDate = doc.export?.createdAt ? new Date(doc.export?.createdAt).getTime() : 0;
        const statusDate = doc.contribution?.statuses.length ? new Date(doc.contribution?.statuses[0].createdAt).getTime() : 0;
        return statusDate > exportDate;
    })
}

export async function fetchContributionDocumentToPublish(): Promise<DocumentElasticWithSource<any>[] | undefined> {
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
    return filterDocumentToPublish(res.data?.documents);
}
