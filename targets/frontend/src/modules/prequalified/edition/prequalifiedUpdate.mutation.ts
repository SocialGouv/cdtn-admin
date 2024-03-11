import { OperationResult, useMutation } from "urql";

import { Prequalified } from "../type";

export const prequalifiedEdit = `
mutation prequalified_edit($id: uuid!, $title: String!, $variants: [String!]!, $documents: [search_prequalified_documents_insert_input!]!) {
  update_search_prequalified_by_pk(pk_columns: {id: $id}, _set: {title: $title, variants: $variants}) {
    __typename
  }
  delete_search_prequalified_documents(where: {prequalifiedId: {_eq: $id}}) {
    affected_rows
  }
  insert_search_prequalified_documents(objects: $documents, on_conflict: {constraint: prequalified_documents_pkey, update_columns: [order]}) {
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
    documents: data.documents.map(({ documentId, prequalifiedId }, order) => ({
      documentId,
      prequalifiedId,
      order,
    })),
  };
};

export const usePrequalifiedUpdateMutation = (): MutationResult => {
  const [, executeUpdate] = useMutation<MutationProps>(prequalifiedEdit);
  const resultFunction = async (data: MutationProps) => {
    const value = mapPrequalified(data);
    const result = await executeUpdate(value);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result;
  };
  return resultFunction;
};
