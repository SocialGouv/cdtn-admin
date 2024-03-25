import { OperationResult, useMutation } from "urql";

export const publishInformationMutation = `
mutation publish_information(
  $id: uuid!
) {
    publish(id: $id, source: "information") {
        cdtnId
    }
}
`;

export type PublishInformationMutationResult = (
  id: string
) => Promise<OperationResult>;

export const usePublishInformationMutation =
  (): PublishInformationMutationResult => {
    const [, execute] = useMutation<string>(publishInformationMutation);
    const resultFunction = async (id: string) => {
      const result = await execute({ id });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    };
    return resultFunction;
  };
