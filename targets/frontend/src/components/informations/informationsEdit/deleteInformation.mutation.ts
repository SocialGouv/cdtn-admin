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

type MutationResult = (id: string) => Promise<OperationResult>;

export const useDeleteInformationMutation = (): MutationResult => {
  const [, execute] = useMutation<string>(deleteInformationMutation);
  const resultFunction = async (id: string) => {
    const result = await execute({
      id,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
