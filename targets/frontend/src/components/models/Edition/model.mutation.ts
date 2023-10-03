import { gql } from "@urql/core";
import { useMutation } from "urql";
import { Model } from "src/components/models/type";
import { LegiReference } from "src/components/forms/LegiReferences/type";

type ModelsInsertInput = {
  description?: String;
  file_name?: String;
  file_size?: number;
  preview_html?: String;
  title?: String;
  type?: String;
};

const updateModelQuery = gql`
  mutation UpdateModel(
    $id: uuid = ""
    $model: model_models_set_input!
    $legiReferences: [model_models_legi_references_insert_input!]!
  ) {
    update_model_models_by_pk(pk_columns: { id: $id }, _set: $model) {
      id
    }
    delete_model_models_legi_references(where: { letter_id: { _eq: $id } }) {
      affected_rows
    }
    insert_model_models_legi_references(
      objects: $legiReferences
      on_conflict: { constraint: models_legi_references_pkey }
    ) {
      affected_rows
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

type MutationGraphQLProps = {
  id: string;
  model: ModelsInsertInput;
  legiReferences: {
    article_id: string;
    letter_id: string;
  }[];
};

type MutationGraphQLResult = { update_model_models_by_pk: { id: string } };

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useModelUpdateMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(updateModelQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      model: {
        title: data.title,
        type: data.type,
        description: data.description,
        file_size: data.fileSize,
        file_name: data.fileName,
        preview_html: data.previewHTML,
      },
      id: data.id,
      legiReferences: formatLegiReferences(data.id, data.legiReferences),
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.update_model_models_by_pk) {
      throw new Error("No data returned from mutation");
    }
    return result.data?.update_model_models_by_pk;
  };
  return resultFunction;
};

const formatLegiReferences = (modelId: string, refs: LegiReference[]) => {
  return refs.map((ref) => ({
    letter_id: modelId,
    article_id: ref.legiArticle.id,
  }));
};
