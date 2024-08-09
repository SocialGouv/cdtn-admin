import { OperationResult, useMutation } from "urql";

export const publishContributionMutation = `
mutation publish_contributions{
    publishAll(source: "contributions") {
        isPending
    }
}
`;

export type PublishMutationResult = () => Promise<OperationResult>;

export const usePublishAllAnswersMutation = (): PublishMutationResult => {
  const [, execute] = useMutation(publishContributionMutation);
  const resultFunction = async () => {
    const result = await execute();
    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
