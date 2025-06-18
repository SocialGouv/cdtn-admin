import { Model } from "../../type";
import { gql, CombinedError, OperationContext, useQuery } from "urql";

export const listModelsQuery = gql`
  query SelectModel($id: uuid!) {
    model: model_models_by_pk(id: $id) {
      id
      title
      metaTitle
      type
      intro
      metaDescription
      previewHTML
      createdAt
      updatedAt
      displayDate
      file {
        id
        url
        size
        altText
      }
      legiReferences: models_legi_references {
        legiArticle {
          cid
          id
          label
        }
      }
      otherReferences: models_other_references {
        id
        label
        url
      }
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

export type ModelListQueryResult = {
  data?: ModelResult;
  error?: CombinedError;
  fetching: boolean;
  reexecuteQuery: (opts?: Partial<OperationContext> | undefined) => void;
};

export const useListModelQuery = ({
  id,
}: ModelListQueryProps): ModelListQueryResult => {
  const [{ data, error, fetching }, reexecuteQuery] = useQuery<QueryResult>({
    query: listModelsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  return {
    data: data?.model,
    error,
    fetching,
    reexecuteQuery,
  };
};
