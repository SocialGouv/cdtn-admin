import { gql } from "urql";

export const whatIsNewItemsQuery = gql`
  query GetWhatIsNewItems {
    items: what_is_new_items(
      order_by: [{ weekStart: desc }, { createdAt: asc }]
    ) {
      id
      weekStart
      kind
      title
      href
      description
      createdAt
      updatedAt
    }
  }
`;

export const whatIsNewItemByIdQuery = gql`
  query GetWhatIsNewItemById($id: uuid!) {
    item: what_is_new_items_by_pk(id: $id) {
      id
      weekStart
      kind
      title
      href
      description
      createdAt
      updatedAt
    }
  }
`;

export type WhatIsNewItemKind =
  | "evolution-juridique"
  | "mise-a-jour-fonctionnelle";

export type WhatIsNewItemRow = {
  id: string;
  weekStart: string; // date (YYYY-MM-DD)
  kind: WhatIsNewItemKind;
  title: string;
  href?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type WhatIsNewItemByIdResponse = {
  item: WhatIsNewItemRow | null;
};
