import { EditorialContent } from "@shared/types";

export type SelectEditorialContentRequest = {
  id: string;
};

export type SelectEditorialContentResponse = {
  content: EditorialContent;
};

export const selectEditorialContentGraphql = `
query getDocumentById($id: String!) {
  document: documents_by_pk(cdtn_id: $id) {
    cdtn_id
    document
    initial_id
    is_published
    is_searchable
    is_available
    meta_description
    slug
    source
    text
    title
  }
}
`;
