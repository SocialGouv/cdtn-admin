import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchAgreementUnextendedQuery = `
query get_agreements_unextended {
    agreement_agreements(where: {unextended: {_eq: true}}) {
      id
    }
  }
  
`;

interface HasuraReturn {
  agreement_agreements: { id: string }[] | undefined;
}

export async function fetchAgreementUnextended(): Promise<string[]> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchAgreementUnextendedQuery, {})
    .toPromise();
  if (res.error) {
    throw res.error;
  }

  return res.data?.agreement_agreements?.map(({ id }) => id) ?? [];
}
