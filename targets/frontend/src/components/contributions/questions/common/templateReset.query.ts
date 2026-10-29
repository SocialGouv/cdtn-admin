import { useQuery } from "urql";

import { Status } from "../../type";

const questionAgreementAnswersQuery = `
query question_agreement_answers($questionId: uuid!) {
  contribution_answers(
    where: {
      question_id: { _eq: $questionId }
      agreement_id: { _neq: "0000" }
    }
    order_by: { agreement_id: asc }
  ) {
    id
    contentType: content_type
    agreement {
      id
      name
      unextended
    }
    statuses(order_by: { created_at: desc }, limit: 1) {
      status
    }
  }
}
`;

export type TemplateResetAnswer = {
  id: string;
  contentType: string | null;
  agreement: { id: string; name: string; unextended: boolean };
  /** Statut courant (absent = « À traiter ») */
  status: Status | undefined;
};

type QueryResult = {
  contribution_answers: (Omit<TemplateResetAnswer, "status"> & {
    statuses: { status: Status }[];
  })[];
};

/**
 * Réponses des CC de la question, quels que soient leur type et leur statut :
 * le template peut leur être appliqué à tout moment (elles repassent alors en
 * rédaction). Les CC non étendues, verrouillées sur « ne prévoit rien », sont exclues.
 */
export const useQuestionAgreementAnswers = (questionId?: string) => {
  const [{ data, fetching, error }, refetch] = useQuery<QueryResult>({
    query: questionAgreementAnswersQuery,
    variables: { questionId },
    pause: !questionId,
    requestPolicy: "network-only",
  });
  const answers: TemplateResetAnswer[] =
    data?.contribution_answers
      .filter((answer) => !answer.agreement.unextended)
      .map(({ statuses, ...answer }) => ({
        ...answer,
        status: statuses[0]?.status,
      })) ?? [];
  return { answers, fetching, error, refetch };
};
