import { useQuery } from "urql";
import { Model } from "../type";
import { gql } from "@urql/core";
import { format, parseISO } from "date-fns";

export const listModelsQuery = gql`
  query SelectModel($id: uuid!) {
    model: model_models_by_pk(id: $id) {
      id
      title
      type
      description
      fileName: file_name
      fileSize: file_size
      previewHTML: preview_html
      createdAt: created_at
      updatedAt: updated_at
    }
  }
`;

export type ModelResult = Model;

export type QueryResult = {
  model: ModelResult;
};

export type ModelListQueryProps = {
  id: string;
};

export type ModelListQueryResult = ModelResult | undefined;

export const useListModelQuery = ({
  id,
}: ModelListQueryProps): ModelListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listModelsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  const model = result.data?.model;
  if (model) {
    const updatedAt = format(parseISO(model.updatedAt), "dd/MM/yyyy");
    return {
      ...model,
      updatedAt,
    };
  }
  return undefined;
};
