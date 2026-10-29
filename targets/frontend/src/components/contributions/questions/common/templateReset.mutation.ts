import { useMutation } from "urql";

import { getServerErrorMessage } from "../../answers/serverError";

/**
 * Les opérations d'une même mutation Hasura s'exécutent dans l'ordre, en une
 * transaction : le statut « En rédaction » est inséré avant le contenu, car le
 * trigger `forbid_highlight_on_content` refuse un contenu surligné (le template
 * peut l'être) sur une réponse dont le statut courant est au-delà de la rédaction.
 * Les infographies sont retirées : elles appartenaient à l'ancien contenu.
 */
export const applyTemplateMutation = `
mutation apply_template_to_answers(
  $ids: [uuid!]!
  $content: String!
  $statuses: [contribution_answer_statuses_insert_input!]!
) {
  insert_contribution_answer_statuses(objects: $statuses) {
    affected_rows
  }
  delete_contribution_answer_infographics(where: { answerId: { _in: $ids } }) {
    affected_rows
  }
  update_contribution_answers(
    where: { id: { _in: $ids } }
    _set: { content: $content, content_type: "ANSWER" }
  ) {
    affected_rows
  }
}
`;

type Result = {
  update_contribution_answers: {
    affected_rows: number;
  };
};

export const buildApplyTemplateVariables = (
  ids: string[],
  content: string,
  userId: string
) => ({
  ids,
  content,
  statuses: ids.map((id) => ({
    answer_id: id,
    status: "REDACTING",
    user_id: userId,
  })),
});

/**
 * Applique le template aux réponses sélectionnées : contenu remplacé, type
 * « Afficher la réponse » et retour « En rédaction », quel que soit leur statut.
 */
export const useApplyTemplateMutation = () => {
  const [, executeUpdate] = useMutation<Result>(applyTemplateMutation);
  return async (ids: string[], content: string, userId: string) => {
    const result = await executeUpdate(
      buildApplyTemplateVariables(ids, content, userId)
    );
    if (result.error) {
      throw new Error(getServerErrorMessage(result.error));
    }
    return result.data?.update_contribution_answers.affected_rows ?? 0;
  };
};
