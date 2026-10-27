import { useMutation } from "urql";

const templateResetMutation = `
mutation reset_answers_from_template($ids: [uuid!]!, $content: String) {
  update_contribution_answers(
    where: { id: { _in: $ids } }
    _set: { content: $content }
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

/**
 * Réinitialise les réponses sélectionnées : leur contenu est remplacé par le
 * template actuel de la question. Réservé aux réponses encore en rédaction
 * (cf. `isResettable`) : au-delà, le serveur refuse un contenu surligné.
 */
export const useTemplateResetMutation = () => {
  const [, executeUpdate] = useMutation<Result>(templateResetMutation);
  return async (ids: string[], content: string | undefined) => {
    const result = await executeUpdate({ ids, content });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data?.update_contribution_answers.affected_rows ?? 0;
  };
};
