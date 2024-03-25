import { useQuery } from "@urql/next";

export const getAlertsQuery = `
query getAlerts {
  sources(order_by:{label:asc}) {
    repository,
    label,
    alerts: alerts_aggregate(where: {status: {_eq: "todo"}}) {
      aggregate {
      	count
      }
    }
  }
}
`;

export type Source = {
  repository: string;
  label: string;
  alerts: {
    aggregate: {
      count: number;
    };
  };
};

export type GetAlertsOutput = {
  sources: Source[];
};

export type NavigationAggregationResult = {
  repository: string;
  label: string;
  aggregateCount: number;
};

export const useNavigationAggregation = ():
  | NavigationAggregationResult[]
  | undefined => {
  const [result] = useQuery<GetAlertsOutput>({
    query: getAlertsQuery,
    requestPolicy: "cache-and-network",
  });
  return result.data?.sources?.map(({ repository, label, alerts }) => ({
    repository,
    label,
    aggregateCount: alerts.aggregate.count,
  }));
};
