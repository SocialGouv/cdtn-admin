import { useQuery } from "urql";
import { Prequalified } from "../type";
import { useMemo } from "react";

const prequalifiedQuery = `
query get_prequalified_by_id($id: uuid) {
    search_prequalified (where: {id: {_eq: $id}}) {
      id
      title
      variants
      documents(order_by: {order: asc}) {
        documentId
        prequalifiedId
        order
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

type QueryProps = {
  id: string;
};

type QueryResult = {
  search_prequalified: Prequalified[];
};

export const usePrequalifiedQuery = ({
  id,
}: QueryProps): Prequalified | undefined => {
  const context = useMemo(
    () => ({ additionalTypenames: ["Prequalified"] }),
    []
  );
  const [result] = useQuery<QueryResult>({
    query: prequalifiedQuery,
    variables: {
      id,
    },
    context,
  });

  if (
    !result?.data?.search_prequalified ||
    !result?.data?.search_prequalified?.length
  ) {
    return;
  }
  const data = result.data?.search_prequalified[0];

  return data;
};
