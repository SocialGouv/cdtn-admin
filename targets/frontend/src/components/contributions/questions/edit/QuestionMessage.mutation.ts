import { gql, useMutation } from "urql";

import { MessageContentInput } from "../common/messageBlock";

const createMessageMutation = gql`
  mutation CreateQuestionMessage(
    $object: contribution_question_messages_insert_input!
  ) {
    insert_contribution_question_messages_one(object: $object) {
      id
    }
  }
`;

const updateMessageMutation = gql`
  mutation UpdateQuestionMessage(
    $id: uuid!
    $set: contribution_question_messages_set_input!
  ) {
    update_contribution_question_messages_by_pk(
      pk_columns: { id: $id }
      _set: $set
    ) {
      id
    }
  }
`;

type CreateResult = {
  insert_contribution_question_messages_one: { id: string };
};

/** Crée une ligne de message propre à une contribution et retourne son identifiant. */
export const useQuestionMessageCreation = () => {
  const [, execute] = useMutation<
    CreateResult,
    { object: { label: string } & MessageContentInput }
  >(createMessageMutation);
  return async (
    object: { label: string } & MessageContentInput
  ): Promise<string> => {
    const result = await execute({ object });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data) {
      throw new Error("Aucune donnée retournée à la création du message");
    }
    return result.data.insert_contribution_question_messages_one.id;
  };
};

/** Met à jour les contenus d'une ligne de message (le libellé n'est pas modifiable). */
export const useQuestionMessageUpdate = () => {
  const [, execute] = useMutation<
    unknown,
    { id: string; set: MessageContentInput }
  >(updateMessageMutation);
  return async (id: string, set: MessageContentInput): Promise<void> => {
    const result = await execute({ id, set });
    if (result.error) {
      throw new Error(result.error.message);
    }
  };
};
