import { OperationResult, useMutation } from "urql";

export const publishContributionMutation = `
mutation publish_contribution(
  $id: uuid!
) {
    publish(id: $id, source: "contribution") {
        cdtnId
    }
}
`;

export type PublishInformationMutationResult = (
  id: string
) => Promise<OperationResult>;

export const usePublishContributionMutation =
  (): PublishInformationMutationResult => {
    const [, execute] = useMutation<string>(publishContributionMutation);
    const resultFunction = async (id: string) => {
      const result = await execute({ id });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    };
    return resultFunction;
  };
