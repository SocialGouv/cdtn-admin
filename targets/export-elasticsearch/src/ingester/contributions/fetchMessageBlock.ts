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
  contribution_questions_by_pk:
    | {
        message: ContributionMessageBlock;
      }
    | undefined;
}

export async function fetchMessageBlock(
  questionId: string
): Promise<ContributionMessageBlock | undefined> {
  console.log("fetchMessageBlock", questionId);
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
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
  return res.data?.contribution_questions_by_pk?.message;
}
