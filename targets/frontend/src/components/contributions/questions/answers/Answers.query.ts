import { gql, OperationContext, useQuery } from "urql";
import { initStatus } from "../../status/utils";

import { Answer } from "../../type";

export const contributionQuestionQuery = gql`
  query SelectQuestion($questionId: uuid!) {
    contribution_answers(
      where: { question_id: { _eq: $questionId } }
      order_by: { agreement_id: asc }
    ) {
      id
      contentType: content_type
      agreement {
        id
        name
      }
      statuses(order_by: { created_at: desc }, limit: 1) {
        status
        createdAt: created_at
        user {
          name
        }
      }
      document_exports(order_by: { created_at: desc }, limit: 1) {
        export_es_status {
          createdAt: created_at
        }
      }
    }
  }
`;

type QueryProps = {
  questionId: string;
};

type QueryOutput = {
  contribution_answers: Pick<
    Answer,
    "id" | "contentType" | "agreement" | "statuses" | "document_exports"
  >[];
};

export type AnswerLight = Pick<
  Answer,
  | "id"
  | "contentType"
  | "agreement"
  | "statuses"
  | "document_exports"
  | "status"
>;

export type QueryResult = {
  answers: AnswerLight[];
  reExecute: (opts?: Partial<OperationContext> | undefined) => void;
};

export const useAnswersQuery = ({
  questionId,
}: QueryProps): QueryResult | undefined | "not_found" | "error" => {
  const [result, reExecute] = useQuery<QueryOutput>({
    query: contributionQuestionQuery,
    requestPolicy: "network-only",
    variables: {
      questionId,
    },
  });
  if (result?.error) {
    console.error(result.error);
    return "error";
  }
  if (!result?.data) {
    return;
  }
  const answers =
    result.data.contribution_answers?.map(
      (answer): AnswerLight => ({
        ...answer,
        status: initStatus(answer as Answer),
      })
    ) ?? [];

  return { answers, reExecute };
};
