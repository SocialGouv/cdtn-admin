import { OperationResult, useMutation } from "urql";

export const publishMutation = `
mutation publish(
  $id: uuid!,
  $source: String!
) {
    publish(id: $id, source: $source) {
        cdtnId
    }
}
`;

export type Source =
  | "information"
  | "modeles_de_courriers"
  | "contributions"
  | "conventions_collectives";

export type PublishProps = {
  id: string;
  source: Source;
};

type Result = {
  cdtnId: string;
};

export type PublishMutationResult = (
  props: PublishProps
) => Promise<OperationResult<Result>>;

export const usePublishMutation = (): PublishMutationResult => {
  const [, execute] = useMutation<Result, PublishProps>(publishMutation);
  return async ({ id, source }: PublishProps) => {
    const result = await execute({ id, source });
    if (result.error) {
      console.error(
        `Publication error for ${source} with id ${id}`,
        result.error
      );
      throw new Error(result.error.message);
    }
    return result;
  };
};
