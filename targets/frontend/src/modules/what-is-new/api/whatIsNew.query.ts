import { gql } from "urql";

export const whatIsNewMonthQuery = gql`
  query GetWhatIsNewMonth($id: uuid!) {
    month: what_is_new_months_by_pk(id: $id) {
      id
      period
      label
      shortLabel
      weeks
      createdAt
      updatedAt
    }
  }
`;

export type WhatIsNewMonthRequest = {
  id: string;
};

export type WhatIsNewMonthResponse = {
  month: {
    id: string;
    period: string;
    label: string;
    shortLabel: string;
    weeks: any;
    createdAt: string;
    updatedAt: string;
  };
};