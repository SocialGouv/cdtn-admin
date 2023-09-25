import { gql } from "@urql/core";
import { useMutation } from "urql";
import { Model } from "src/components/models/type";

type ModelsInsertInput = {
  description?: String;
  file_name?: String;
  file_size?: number;
  id?: string;
  preview_html?: String;
  title?: String;
  type?: String;
};

const upsertModelQuery = gql`
  mutation UpsertModel($model: model_models_insert_input!) {
    insert_model_models_one(
      on_conflict: {
        constraint: models_pkey
        update_columns: [
          description
          file_name
          file_size
          preview_html
          title
          type
        ]
      }
      object: $model
    ) {
      id
      __typename
    }
  }
`;

export type MutationProps = Pick<
  Model,
  | "id"
  | "title"
  | "type"
  | "updatedAt"
  | "description"
  | "fileSize"
  | "fileName"
  | "previewHTML"
>;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = { model: ModelsInsertInput };
type MutationGraphQLResult = { insert_model_models_one: { id: string } };
export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useModelUpdateMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(upsertModelQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      model: {
        id: data.id,
        title: data.title,
        type: data.type,
        description: data.description,
        file_size: data.fileSize,
        file_name: data.fileName,
        preview_html: data.previewHTML,
      },
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.insert_model_models_one) {
      throw new Error("No data returned from mutation");
    }
    return result.data?.insert_model_models_one;
  };
  return resultFunction;
};
