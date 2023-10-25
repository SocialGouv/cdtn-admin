import { OperationResult, useMutation } from "urql";

export const publishMutation = `
mutation publish_information(
  $id: uuid!
) {
    publish(id: $id, source: "modeles_de_courriers") {
        cdtnId
    }
}
`;

export type PublishMutationResult = (
  id: string
) => Promise<OperationResult>;

export const usePublishMutation =
  (): PublishMutationResult => {
    const [, execute] = useMutation<string>(publishMutation);
    const resultFunction = async (id: string) => {
      const result = await execute({ id });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    };
    return resultFunction;
  };
