import type { HasuraDocument } from "@shared/types";
import type { DilaRef } from "@socialgouv/contributions-data-types";

export type DocumentReferences = {
  document: DocumentInfo;
  references: DocumentReference[];
};

export type DocumentReference = Pick<
  DilaRef,
  "dila_cid" | "dila_container_id" | "dila_id" | "title" | "url"
>;

export type DocumentInfo = Pick<HasuraDocument, "source" | "title"> & {
  id: string;
};
