import { gqlClient, logger } from "@shared/utils";

const fetchContribs = `
query fetchContribs() {
  documents(where: {source: {_eq: "contributions"}, is_available: {_eq: true}, is_published: {_eq: true}}) {
    slug
    source
    title
    cdtnId: cdtn_id
    document
  }
}
`;

interface HasuraReturn {
  documents: ContributionTableDocument[];
}

export interface ContributionTableDocument {
  cdtnId: string;
  title: string;
  slug: string;
  document: any;
  source: string;
}

export async function fetchAllContributionsDocument(): Promise<
  ContributionTableDocument[]
> {
  const HASURA_GRAPHQL_ENDPOINT = "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET = "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchContribs, {})
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data?.documents.length) {
    logger.error("No contributions found");
    return [];
  }
  return res.data.documents;
}

const editContributionWithCdtnId = `
mutation editContribution($cdtnId: String!, $document: jsonb) {
  update_documents(where: {cdtn_id: {_eq: $cdtnId}, source: {_eq: "contributions"}}, _set: {document: $document}) {
    affected_rows
  }
}
`;

export async function editContentOfContribution(
  cdtnId: string,
  document: any
): Promise<void> {
  const HASURA_GRAPHQL_ENDPOINT = "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET = "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .mutation(editContributionWithCdtnId, {
      cdtnId,
      document,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  return;
}
