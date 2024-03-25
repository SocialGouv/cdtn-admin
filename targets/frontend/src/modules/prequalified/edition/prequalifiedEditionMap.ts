import { Prequalified, PrequalifiedDocument } from "../type";

export type HasuraInput = Omit<Prequalified, "documents"> & {
  documents: {
    data: PrequalifiedDocument[];
    on_conflict: {
      constraint: string;
      update_columns: string[];
    };
  };
};

export const mapPrequalified = (data: Prequalified): HasuraInput => {
  return {
    id: data.id,
    title: data.title,
    variants: data.variants,
    documents: {
      data: data.documents.map(({ documentId }, order) => ({
        documentId,
        order,
      })),
      on_conflict: {
        constraint: "prequalified_documents_pkey",
        update_columns: ["order", "prequalifiedId", "documentId"],
      },
    },
  };
};
