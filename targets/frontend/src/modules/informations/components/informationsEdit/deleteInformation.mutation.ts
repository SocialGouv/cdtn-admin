import { OperationResult, useMutation } from "urql";

export const deleteInformationMutation = `
mutation delete_information(
  $id: uuid!
) {
  delete_information_informations (
    where: {id: {_eq: $id}}
  ) {
    affectedRows: affected_rows
  }
}
`;

export type DeleteInformationMutationResult = (
  id: string
) => Promise<OperationResult>;

export const useDeleteInformationMutation =
  (): DeleteInformationMutationResult => {
    const [, execute] = useMutation<string>(deleteInformationMutation);
    const resultFunction = async (id: string) => {
      const result = await execute({ id });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    };
    return resultFunction;
  };
