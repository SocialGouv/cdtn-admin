import { Prequalified } from "../type";
import { useQuery } from "urql";

const prequalifiedQuery = `
  query get_prequalified_list($search: String) {
    search_prequalified(
      where: {
        title: { _ilike: $search }
      }
      order_by: {title: asc}
    ) {
      variants
      title
      id
      documents {
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

type QueryResult = {
  search_prequalified: Prequalified[];
};

export type PrequalifiedListQueryProps = {
  search?: string;
};

export const usePrequalifiedListQuery = ({
  search,
}: PrequalifiedListQueryProps): Prequalified[] | undefined => {
  const [result] = useQuery<QueryResult>({
    query: prequalifiedQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search,
    },
  });

  return result?.data?.search_prequalified;
};
