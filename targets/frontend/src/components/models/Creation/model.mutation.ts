import { gql } from "@urql/core";
import { useMutation } from "urql";
import { Model } from "src/components/models/type";
import { LegiReference } from "src/components/forms/LegiReferences/type";

type ModelsInsertInput = {
  description?: String;
  file_name?: String;
  file_size?: number;
  id?: string;
  preview_html?: String;
  title?: String;
  type?: String;
  models_legi_references: {
    data: {
      article_id: string;
    }[];
  };
};

const insertModelQuery = gql`
  mutation InsertModel($model: model_models_insert_input!) {
    insert_model_models_one(object: $model) {
      id
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
  | "legiReferences"
>;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = { model: ModelsInsertInput };
type MutationGraphQLResult = { insert_model_models_one: { id: string } };

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useModelInsertMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(insertModelQuery);
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
        models_legi_references: formatLegiReferences(data.legiReferences),
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

const formatLegiReferences = (
  refs: LegiReference[]
): ModelsInsertInput["models_legi_references"] => {
  return {
    data: refs.map((ref) => ({
      article_id: ref.legiArticle.id,
    })),
  };
};
