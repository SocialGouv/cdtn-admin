import { ContributionAgreementMessage } from "@shared/types";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchAgreementMessageByIdcc = `
query get_agreement_message($idcc: bpchar) {
  contribution_agreement_messages(
    where: {agreement_id: {_eq: $idcc} }
  ) {
    agreement_id
    content
    id
  }
}
`;

interface HasuraReturn {
  contribution_agreement_messages: [ContributionAgreementMessage] | undefined;
}

export async function fetchAgreementMessage(
  idcc: string
): Promise<string | undefined> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchAgreementMessageByIdcc, {
      idcc,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }

  return res.data?.contribution_agreement_messages?.length
    ? res.data.contribution_agreement_messages[0].content
    : undefined;
}
