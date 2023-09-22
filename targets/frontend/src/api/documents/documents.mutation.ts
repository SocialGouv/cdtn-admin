import { gql } from "@urql/core";

export const documentsMutation = gql`
  mutation publishInformation(
    $cdtnId: !uuid
    $document: jsonb
    $text: String
    $title: String
    $metaDescription: String
  ) {
    update_documents(
      where: { cdtn_id: { _eq: $cdtnId } }
      _set: {
        document: $document
        slug: $slug
        text: $text
        title: $title
        meta_description: $metaDescription
      }
    ) {
      returning {
        cdtn_id
      }
    }
  }
`;

export type DocumentsRequest = {
  cdtnId: string;
  document: string;
  slug: string;
  text: string;
  title: string;
  metaDescription: string;
};
