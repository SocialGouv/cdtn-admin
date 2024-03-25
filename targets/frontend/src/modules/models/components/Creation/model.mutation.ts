import { gql, useMutation } from "@urql/next";
import { LegiReference } from "src/components/forms/LegiReferences/type";
import { FormDataResult } from "../Common";
import { OtherReference } from "../../../../components/forms/OtherReferences/type";
import { ModelModelsInsertInput } from "../graphql.type";

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
        models_other_references: formatOtherReferences(data.otherReferences),
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

const formatOtherReferences = (
  refs: OtherReference[]
): ModelModelsInsertInput["models_other_references"] => {
  return {
    data: refs.map((ref) => ({
      label: ref.label,
      url: ref.url,
    })),
  };
};
