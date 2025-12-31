import { gql, useMutation } from "urql";
import type { WhatIsNewMonth } from "../../type";

const insertWhatIsNewMonthQuery = gql`
  mutation InsertWhatIsNewMonth($month: what_is_new_months_insert_input!) {
    insert_what_is_new_months_one(object: $month) {
      id
    }
  }
`;

type MutationGraphQLProps = {
  month: {
    period: string;
    label: string;
    shortLabel: string;
    weeks: unknown;
  };
};

type MutationGraphQLResult = {
  insert_what_is_new_months_one: { id: string } | null;
};

export type MutationFn = (props: WhatIsNewMonth) => Promise<{ id: string }>;

export const useWhatIsNewMonthInsertMutation = (): MutationFn => {
  const [, execute] = useMutation<MutationGraphQLResult, MutationGraphQLProps>(
    insertWhatIsNewMonthQuery
  );

  return async (data: WhatIsNewMonth) => {
    const result = await execute({
      month: {
        period: data.period,
        label: data.label,
        shortLabel: data.shortLabel,
        weeks: data.weeks as unknown,
      },
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
    const inserted = result.data?.insert_what_is_new_months_one;
    if (!inserted) {
      throw new Error("No data returned from mutation");
    }
    return inserted;
  };
};