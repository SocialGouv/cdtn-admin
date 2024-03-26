import { useQuery, gql } from "urql";
import { Model } from "../../type";

export const listModelsQuery = gql`
  query ListModels($search: String) {
    models: model_models(
      where: { title: { _ilike: $search } }
      order_by: { updatedAt: desc }
    ) {
      id
      title
      type
      updatedAt
    }
  }
`;

export type ModelResult = Pick<Model, "id" | "title" | "type" | "updatedAt">;

export type QueryResult = {
  models: ModelResult[];
};

export type ModelListQueryProps = {
  search?: string;
};

export type ModelListQueryResult = {
  rows: ModelResult[];
};

export const useListModelQuery = ({
  search,
}: ModelListQueryProps): ModelListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listModelsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search: search?.length ?? 0 > 0 ? `%${search}%` : "%",
    },
  });
  return {
    rows: result.data?.models ?? [],
  };
};
