import { gql, useQuery } from "urql";
import { News } from "../../type";

export const listNewsQuery = gql`
  query ListNews($search: String) {
    news: news_news(
      where: { title: { _ilike: $search } }
      order_by: { updatedAt: desc }
    ) {
      id
      title
      displayDate
    }
  }
`;

export type NewsResult = Pick<News, "id" | "title" | "displayDate">;

export type QueryResult = {
  news: NewsResult[];
};

export type NewsListQueryProps = {
  search?: string;
};

export type NewsListQueryResult = {
  rows: NewsResult[];
};

export const useListNewsQuery = ({
  search,
}: NewsListQueryProps): NewsListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listNewsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search: (search?.length ?? 0) > 0 ? `%${search}%` : "%",
    },
  });
  return {
    rows: result.data?.news ?? [],
  };
};
