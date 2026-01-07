import { gql } from "urql";

import type {
  WhatIsNewItemKind,
  WhatIsNewItemRow,
} from "../../api/whatIsNewItems.query";

export const itemsAggregateQuery = gql`
  query WhatIsNewItemsAggregate {
    agg: what_is_new_items_aggregate {
      aggregate {
        min {
          weekStart
        }
        max {
          weekStart
        }
      }
    }
  }
`;

export const itemsByRangeQuery = gql`
  query WhatIsNewItemsByRange($from: date!, $to: date!) {
    items: what_is_new_items(
      where: { weekStart: { _gte: $from, _lte: $to } }
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

export const insertItemMutation = gql`
  mutation InsertWhatIsNewItem($item: what_is_new_items_insert_input!) {
    insert_what_is_new_items_one(object: $item) {
      id
    }
  }
`;

export const updateItemMutation = gql`
  mutation UpdateWhatIsNewItem(
    $id: uuid!
    $patch: what_is_new_items_set_input!
  ) {
    update_what_is_new_items_by_pk(pk_columns: { id: $id }, _set: $patch) {
      id
      updatedAt
    }
  }
`;

export const deleteItemMutation = gql`
  mutation DeleteWhatIsNewItem($id: uuid!) {
    delete_what_is_new_items_by_pk(id: $id) {
      id
    }
  }
`;

export type ItemsAggregateResult = {
  agg: {
    aggregate: {
      min: { weekStart: string | null } | null;
      max: { weekStart: string | null } | null;
    } | null;
  } | null;
};

export type ItemsByRangeResult = {
  items: WhatIsNewItemRow[];
};

export type InsertVariables = {
  item: {
    weekStart: string;
    kind: WhatIsNewItemKind;
    title: string;
    href: string;
    description: string;
  };
};

export type UpdateVariables = {
  id: string;
  patch: {
    weekStart?: string;
    kind?: WhatIsNewItemKind;
    title?: string;
    href?: string | null;
    description?: string | null;
  };
};

export type DeleteVariables = {
  id: string;
};
