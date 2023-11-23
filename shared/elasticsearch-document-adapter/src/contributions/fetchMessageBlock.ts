import { ContributionMessageBlock } from "@shared/types";
import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchMessageBlockById = `
query get_question($id: uuid!) {
  contribution_questions_by_pk(id: $id) {
    message {
      id
      label
      contentAgreement
      contentLegal
      contentNotHandled
    }
  }
}
`;

interface HasuraReturn {
  contribution_question_messages_by_pk:
    | {
        message: ContributionMessageBlock;
      }
    | undefined;
}

export async function fetchMessageBlock(
  questionId: string
): Promise<ContributionMessageBlock> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchMessageBlockById, {
      id: questionId,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  if (!res.data?.contribution_question_messages_by_pk?.message) {
    throw new Error(
      `Impossible de récupérer la message block pour la question avec l'id ${questionId}`
    );
  }
  return res.data.contribution_question_messages_by_pk.message;
}
