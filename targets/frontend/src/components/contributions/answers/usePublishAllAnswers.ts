import { OperationResult, useMutation } from "urql";

export const publishContributionMutation = `
mutation publish_contributions($questionId: uuid!){
    publishAll(questionId: $questionId, source: "contributions") {
        isPending
    }
}
`;

export type PublishMutationResult = (
  questionId: string
) => Promise<OperationResult>;

export const usePublishAllAnswersMutation = (): PublishMutationResult => {
  const [, execute] = useMutation(publishContributionMutation);
  const resultFunction = async (questionId: string) => {
    const result = await execute({ questionId });
    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
