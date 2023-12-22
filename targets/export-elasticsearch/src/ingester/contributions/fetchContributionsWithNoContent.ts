import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchContribTypeNothingForQuestion = `
query contribution_answers_type_nothing($id: uuid) {
  contribution_answers(where: {question: {id: {_eq: $id}}, content_type: {_eq: "NOTHING"}, statuses: {}}) {
    agreement {
      id
    }
    statuses(order_by: {created_at: desc}, limit: 1) {
      status
    }
  }
}

`;

interface HasuraReturn {
  contribution_answers:
    | [
        {
          agreement: {
            id: string;
          };
          statuses:
            | [
                {
                  status: string;
                }
              ]
            | [];
        }
      ];
}

export async function fetchContributionsWithNoContent(
  questionId: string
): Promise<string[]> {
  const HASURA_GRAPHQL_ENDPOINT = context.get("cdtnAdminEndpoint");
  const HASURA_GRAPHQL_ENDPOINT_SECRET = context.get("cdtnAdminEndpointSecret");
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchContribTypeNothingForQuestion, {
      id: questionId,
    })
    .toPromise();
  if (res.error) {
    console.log(
      "Error while executing fetchContributionsWithNoContent",
      res.error
    );
    throw res.error;
  }

  if (!res.data) {
    return [];
  }

  return res.data.contribution_answers
    .filter((contrib) => {
      return (
        contrib.statuses.length && contrib.statuses[0].status === "PUBLISHED"
      );
    })
    .map((contrib) => contrib.agreement.id);
}
