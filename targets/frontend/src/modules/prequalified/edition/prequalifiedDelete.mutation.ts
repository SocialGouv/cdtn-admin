import { OperationResult, useMutation } from "urql";
import { gql } from "@urql/core";

export const deletePrequalifiedMutation = gql`
  mutation delete_prequalified($id: uuid) {
    delete_search_prequalified(where: { id: { _eq: $id } }) {
      affectedRows: affected_rows
    }
    delete_search_prequalified_documents(
      where: { prequalifiedId: { _eq: $id } }
    ) {
      affected_rows
    }
  }
`;

export type DeletePrequalifiedMutationResult = (
  id: string
) => Promise<OperationResult>;

export const useDeletePrequalifiedMutation =
  (): DeletePrequalifiedMutationResult => {
    const [, execute] = useMutation<string>(deletePrequalifiedMutation);
    const resultFunction = async (id: string) => {
      const result = await execute({ id });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    };
    return resultFunction;
  };
