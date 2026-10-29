import { News } from "../../type";
import { CombinedError, OperationContext, useQuery } from "urql";
import {
  mapNewsRow,
  NewsResponse,
  selectNewsQuery,
} from "../../api/news.query";

export type NewsResult = News;

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
  const [{ data, error, fetching }, reexecuteQuery] = useQuery<NewsResponse>({
    query: selectNewsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  return {
    data: data?.news ? mapNewsRow(data.news) : undefined,
    error,
    fetching,
    reexecuteQuery,
  };
};
