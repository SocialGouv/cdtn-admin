import { gql, useQuery } from "urql";

export const listWhatIsNewMonthsQuery = gql`
  query ListWhatIsNewMonths($search: String) {
    months: what_is_new_months(
      where: { label: { _ilike: $search } }
      order_by: { updatedAt: desc }
    ) {
      id
      period
      label
      shortLabel
      updatedAt
    }
  }
`;

export type WhatIsNewMonthListResult = {
  id: string;
  period: string;
  label: string;
  shortLabel: string;
  updatedAt?: string;
};

export type QueryResult = {
  months: WhatIsNewMonthListResult[];
};

export type WhatIsNewMonthListQueryProps = {
  search?: string;
};

export type WhatIsNewMonthListQueryResult = {
  rows: WhatIsNewMonthListResult[];
};

export const useListWhatIsNewMonthsQuery = ({
  search,
}: WhatIsNewMonthListQueryProps): WhatIsNewMonthListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listWhatIsNewMonthsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search: (search?.length ?? 0) > 0 ? `%${search}%` : "%",
    },
  });

  return {
    rows: result.data?.months ?? [],
  };
};