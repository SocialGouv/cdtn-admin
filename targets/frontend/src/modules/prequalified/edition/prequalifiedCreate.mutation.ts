import { OperationResult, useMutation } from "urql";

import { Prequalified } from "../type";

export const prequalifiedCreate = `
mutation prequalified_create($title: String!, $variants: [String!]!, $documents: [search_prequalified_documents_insert_input!]!) {
  insert_search_prequalified(objects: {title: $title, variants: $variants}) {
    affected_rows
  }
  insert_search_prequalified_documents(objects: $documents, on_conflict: {constraint: prequalified_documents_pkey}, update_columns: [order]) {
    affected_rows
  }
}
`;

export type MutationProps = Prequalified;

type MutationResult = (
  props: MutationProps
) => Promise<OperationResult<Prequalified>>;

const mapPrequalified = (data: Prequalified): Prequalified => {
  return {
    id: data.id,
    title: data.title,
    variants: data.variants,
    documents: data.documents.map(({ documentId }, order) => ({
      documentId,
      order,
    })),
  };
};

export const usePrequalifiedCreateMutation = (): MutationResult => {
  const [, executeCreate] = useMutation<MutationProps>(prequalifiedCreate);
  const resultFunction = async (data: MutationProps) => {
    const value = mapPrequalified(data);
    const result = await executeCreate(value);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
