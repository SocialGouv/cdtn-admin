import { News } from "../../type";
import { CombinedError, gql, OperationContext, useQuery } from "urql";

export const selectNewsQuery = gql`
  query SelectNews($id: uuid!) {
    news: news_news_by_pk(id: $id) {
      id
      title
      metaTitle
      content
      metaDescription
      createdAt
      updatedAt
      displayDate
      cdtnReferences: news_cdtn_references {
        document {
          cdtnId: cdtn_id
          title
          source
          slug
        }
      }
    }
  }
`;

export type NewsResult = News;

export type QueryResult = {
  news: NewsResult;
};

export type NewsQueryProps = {
  id: string;
};

export type NewsQueryResult = {
  data?: NewsResult;
  error?: CombinedError;
  fetching: boolean;
  reexecuteQuery: (opts?: Partial<OperationContext> | undefined) => void;
};

export const useSelectNewsQuery = ({ id }: NewsQueryProps): NewsQueryResult => {
  const [{ data, error, fetching }, reexecuteQuery] = useQuery<QueryResult>({
    query: selectNewsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  return {
    data: data?.news,
    error,
    fetching,
    reexecuteQuery,
  };
};
