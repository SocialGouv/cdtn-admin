import { gqlClient } from "@shared/utils";
import { context } from "../context";

const fetchQuestionIntroductionsById = `
query get_question_introductions($id: uuid!) {
  contribution_questions_by_pk(id: $id) {
    introduction_nothing
    introduction_cdt
  }
}
`;

export type QuestionIntroductions = {
  introduction_nothing: string | null;
  introduction_cdt: string | null;
};

interface HasuraReturn {
  contribution_questions_by_pk: QuestionIntroductions | null;
}

export async function fetchQuestionIntroductions(
  questionId: string
): Promise<QuestionIntroductions | undefined> {
  const HASURA_GRAPHQL_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const HASURA_GRAPHQL_ENDPOINT_SECRET =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const res = await gqlClient({
    graphqlEndpoint: HASURA_GRAPHQL_ENDPOINT,
    adminSecret: HASURA_GRAPHQL_ENDPOINT_SECRET,
  })
    .query<HasuraReturn>(fetchQuestionIntroductionsById, {
      id: questionId,
    })
    .toPromise();
  if (res.error) {
    throw res.error;
  }
  return res.data?.contribution_questions_by_pk ?? undefined;
}
