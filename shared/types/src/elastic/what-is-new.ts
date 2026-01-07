import { DocumentElasticWithSource } from "./common";

export type WhatIsNewItemKind =
  | "evolution-juridique"
  | "mise-a-jour-fonctionnelle";

export type WhatIsNewItemDoc = {
  weekStart: string; // YYYY-MM-DD (date-only)
  kind: WhatIsNewItemKind;
  description?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ElasticWhatIsNewItem = DocumentElasticWithSource<
  WhatIsNewItemDoc,
  "what_is_new"
>;
