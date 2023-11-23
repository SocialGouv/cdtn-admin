import { ContributionMessageBlock } from "@shared/types";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchMessageBlockById = `
query get_message_block($messageId: uuid!) {
  contribution_question_messages_by_pk(id: $messageId) {
    id
    label
    contentAgreement
    contentLegal
    contentNotHandled
  }
}
`;

interface HasuraReturn {
  contribution_question_messages_by_pk: ContributionMessageBlock;
}

export async function fetchMessageBlock(
  messageId: string
): Promise<ContributionMessageBlock> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchMessageBlockById, {
      messageId,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (
    !res.data ||
    res.error ||
    !res.data.contribution_question_messages_by_pk
  ) {
    throw new Error(
      `Impossible de récupérer la message block pour l'id ${messageId}`
    );
  }
  return res.data.contribution_question_messages_by_pk;
}
