import { EditorialContent, EditorialContentDoc } from "@shared/types";

export type UpdateEditorialContentRequest = {
  cdtnId: string;
  document: EditorialContentDoc;
  title: string;
  metaDescription: string;
  slug: string;
};

export type UpdateEditorialContentResponse = {
  content: EditorialContent;
};

export const updateEditorialContentGraphql = `
mutation editContent(
  $cdtnId: String!
  $document: jsonb!
  $title: String!
  $metaDescription: String!
  $slug: String!
) {
  content: update_documents_by_pk(
    pk_columns: { cdtn_id: $cdtnId }
    _set: {
      document: $document
      title: $title
      meta_description: $metaDescription
      slug: $slug
      text: $title
    }
  ) {
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
