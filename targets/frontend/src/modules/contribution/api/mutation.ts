import { gql } from "urql";

export const updatePublicationMutation = gql`
  mutation contribution_answer($id: uuid!, $cdtnId: String) {
    update_contribution_answers_by_pk(
      pk_columns: { id: $id }
      _set: { cdtnId: $cdtnId }
    ) {
      id
    }
  }
`;

export const updateDisplayDateMutation = gql`
  mutation contribution_answer_display_date($id: uuid!, $displayDate: date!) {
    update_contribution_answers_by_pk(
      pk_columns: { id: $id }
      _set: { display_date: $displayDate }
    ) {
      id
    }
  }
`;
