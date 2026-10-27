import { useQuery } from "urql";

import { Status } from "../../type";

const questionTemplateAnswersQuery = `
query question_template_answers($questionId: uuid!) {
  contribution_answers(
    where: {
      question_id: { _eq: $questionId }
      agreement_id: { _neq: "0000" }
      content_type: { _eq: "ANSWER" }
    }
    order_by: { agreement_id: asc }
  ) {
    id
    agreement {
      id
      name
    }
    statuses(order_by: { created_at: desc }, limit: 1) {
      status
    }
  }
}
`;

type TemplateAnswer = {
  id: string;
  agreement: { id: string; name: string };
  statuses: { status: Status }[];
};

type QueryResult = {
  contribution_answers: TemplateAnswer[];
};

/**
 * Réponses des CC de type « Afficher la réponse » : les seules qui portent
 * une copie du template et peuvent donc être réinitialisées depuis la question.
 */
export const useQuestionTemplateAnswers = (questionId?: string) => {
  const [{ data, fetching }, refetch] = useQuery<QueryResult>({
    query: questionTemplateAnswersQuery,
    variables: { questionId },
    pause: !questionId,
    requestPolicy: "network-only",
  });
  const answers =
    data?.contribution_answers.map((answer) => ({
      ...answer,
      // Seules les réponses en rédaction peuvent recevoir le template :
      // au-delà (REDACTED et plus), le serveur refuse un contenu surligné.
      resettable: isResettable(answer.statuses[0]?.status),
    })) ?? [];
  return { answers, fetching, refetch };
};

export const isResettable = (status: Status | undefined): boolean =>
  status === undefined || status === "TODO" || status === "REDACTING";
