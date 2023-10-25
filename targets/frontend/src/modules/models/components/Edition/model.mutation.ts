import { gql } from "@urql/core";
import { useMutation } from "urql";
import { LegiReference } from "src/components/forms/LegiReferences/type";
import { FormDataResult } from "../Common";
import {
  FilesConstraint,
  FilesUpdateColumn,
  ModelModelsInsertInput,
} from "../Creation/model.mutation";

const updateModelQuery = gql`
  mutation UpdateModel($id: uuid = "", $model: model_models_insert_input!) {
    delete_model_models_legi_references(where: { modelId: { _eq: $id } }) {
      affected_rows
    }
    insert_model_models_one(
      object: $model
      on_conflict: {
        constraint: models_pkey
        update_columns: [
          title
          metaTitle
          description
          metaDescription
          type
          previewHTML
        ]
      }
    ) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = {
  id: string;
  model: ModelModelsInsertInput;
};

type MutationGraphQLResult = { insert_model_models_one: { id: string } };

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useModelUpdateMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(updateModelQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      id: data.id,
      model: {
        id: data.id,
        title: data.title,
        metaTitle: data.metaTitle,
        description: data.description,
        metaDescription: data.metaDescription,
        type: data.type,
        file: {
          data: {
            url: data.file.url,
            size: data.file.size,
            altText: data.file.altText,
            id: data.file.id,
          },
          on_conflict: {
            constraint: FilesConstraint.FilesPkey,
            update_columns: [
              FilesUpdateColumn.Url,
              FilesUpdateColumn.Size,
              FilesUpdateColumn.AltText,
            ],
          },
        },
        previewHTML: data.previewHTML,
        models_legi_references: {
          data: formatLegiReferences(data.legiReferences),
        },
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

const formatLegiReferences = (refs: LegiReference[]) => {
  return refs.map((ref) => ({
    articleId: ref.legiArticle.id,
  }));
};
