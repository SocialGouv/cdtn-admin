import { gql } from "urql";

export const updatePublicationMutation = gql`
mutation contribution_answer($id: uuid!, $cdtnId: String!) {
  update_contribution_answers_by_pk(pk_columns: {id: $id}, _set: {cdtnId: $cdtnId}) {
    id
  }
}
`;
