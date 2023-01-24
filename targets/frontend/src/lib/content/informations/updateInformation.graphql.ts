import { EditorialContentDoc } from "@shared/types";

export type EditorialContentRequest = {
  cdtnId: string;
  document: EditorialContentDoc;
  title: string;
  metaDescription: string;
  slug: string;
};

export type EditorialContentResponse = {
  content: Content;
};

export type Content = {
  slug: string;
  metaDescription: string;
  __typename: string;
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
    slug
    metaDescription: meta_description
    __typename
  }
}
`;
