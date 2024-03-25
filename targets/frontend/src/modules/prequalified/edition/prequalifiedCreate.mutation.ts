import { OperationResult, useMutation } from "urql";

import { Prequalified } from "../type";
import { mapPrequalified } from "./prequalifiedEditionMap";

export const prequalifiedCreate = `
mutation prequalified_create($value: search_prequalified_insert_input!) {
  insert_search_prequalified_one(object: $value, on_conflict: {constraint: prequalified_pkey,update_columns: [id, title, variants]}) {
    id
  }
}
`;

export type MutationProps = Prequalified;

type MutationResult = (
  props: MutationProps
) => Promise<OperationResult<Prequalified>>;

export const usePrequalifiedCreateMutation = (): MutationResult => {
  const [, executeCreate] = useMutation<MutationProps>(prequalifiedCreate);
  const resultFunction = async (data: MutationProps) => {
    const value = mapPrequalified(data);
    const result = await executeCreate({ value });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
