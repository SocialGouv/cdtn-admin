import { gql } from "@urql/core";
import { useMutation } from "urql";
import { LegiReference } from "src/components/forms/LegiReferences/type";
import { FormDataResult } from "../Common";

export type FilesInsertInput = {
  altText?: string | null;
  id?: string | null;
  size?: string | null;
  url?: string;
};

export enum FilesConstraint {
  /** unique or primary key constraint on columns "id" */
  FilesPkey = "files_pkey",
}

export enum FilesUpdateColumn {
  /** column name */
  AltText = "altText",
  /** column name */
  Id = "id",
  /** column name */
  Size = "size",
  /** column name */
  Url = "url",
}

export type FilesOnConflict = {
  constraint: FilesConstraint;
  update_columns?: FilesUpdateColumn[];
};

export type FilesObjRelInsertInput = {
  data: FilesInsertInput;
  on_conflict?: FilesOnConflict;
};

export type LegiArticlesInsertInput = {
  cid?: string;
  id?: string;
  label?: string;
};

export type LegiArticlesObjRelInsertInput = {
  data: LegiArticlesInsertInput;
};

export type ModelModelsObjRelInsertInput = {
  data: ModelModelsInsertInput;
};

export type ModelModelsLegiReferencesInsertInput = {
  articleId?: string;
};

export type ModelModelsLegiReferencesArrRelInsertInput = {
  data: ModelModelsLegiReferencesInsertInput[];
};

export type Model_Models_Other_References_Insert_Input = {
  id?: string;
  label?: string;
  model?: string;
  modelId?: string;
  url?: string;
};

export type ModelModelsOtherReferencesArrRelInsertInput = {
  data: Array<Model_Models_Other_References_Insert_Input>;
};

export type ModelModelsInsertInput = {
  createdAt?: string;
  description?: string;
  file?: FilesObjRelInsertInput;
  fileId?: string;
  id?: string;
  metaDescription?: string;
  metaTitle?: string;
  models_legi_references?: ModelModelsLegiReferencesArrRelInsertInput;
  models_other_references?: ModelModelsOtherReferencesArrRelInsertInput;
  previewHTML?: string;
  title?: string;
  type?: string;
  updatedAt?: string;
};

const insertModelQuery = gql`
  mutation InsertModel($model: model_models_insert_input!) {
    insert_model_models_one(object: $model) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = { model: ModelModelsInsertInput };
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
        title: data.title,
        metaTitle: data.metaTitle,
        type: data.type,
        description: data.description,
        metaDescription: data.metaDescription,
        file: {
          data: data.file,
        },
        previewHTML: data.previewHTML,
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
): ModelModelsInsertInput["models_legi_references"] => {
  return {
    data: refs.map((ref) => ({
      articleId: ref.legiArticle.id,
    })),
  };
};
