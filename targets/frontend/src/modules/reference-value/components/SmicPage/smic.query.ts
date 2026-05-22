import { gql, useQuery } from "urql";
import { SmicValue } from "../../type";

const smicValuesQuery = gql`
  query SmicValues {
    reference_value_smic_values(order_by: { applicationDate: desc }) {
      id
      hourlyValue
      applicationDate
      note
      createdAt
      createdBy
    }
  }
`;

type QueryResult = {
  reference_value_smic_values: SmicValue[];
};

export function useSmicValuesQuery(options?: { pause?: boolean }) {
  const [result, reexecute] = useQuery<QueryResult>({
    query: smicValuesQuery,
    requestPolicy: "cache-and-network",
    pause: options?.pause,
  });

  const today = new Date().toISOString().split("T")[0];
  const allValues = result.data?.reference_value_smic_values ?? [];

  const currentValue =
    allValues.find((v) => v.applicationDate <= today) ?? null;

  return {
    currentValue,
    history: allValues,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}
