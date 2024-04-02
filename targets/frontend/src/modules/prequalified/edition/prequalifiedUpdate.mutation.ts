import { OperationResult, useMutation } from "urql";

import { Prequalified } from "../type";
import { mapPrequalified } from "./prequalifiedEditionMap";

export const prequalifiedUpdate = `
mutation prequalified_create($id: uuid, $value: search_prequalified_insert_input!) {
  delete_search_prequalified_documents(where: {prequalifiedId: {_eq: $id}}) {
    affected_rows
  }
  insert_search_prequalified_one(object: $value, on_conflict: {constraint: prequalified_pkey,update_columns: [id, title, variants]}) {
    id
  }
}
`;

export type MutationProps = Prequalified;

type MutationResult = (
  props: MutationProps
) => Promise<OperationResult<Prequalified>>;

export const usePrequalifiedUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(prequalifiedUpdate);
  const resultFunction = async (data: MutationProps) => {
    const value = mapPrequalified(data);
    const result = await executeUpdate({ id: value.id, value });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
