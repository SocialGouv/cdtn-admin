import { gql } from "urql";
import { Information } from "../type";

export const informationsQuery = gql`
  query informations($id: uuid) {
    information_informations(where: { id: { _eq: $id } }) {
      description
      id
      intro
      metaDescription
      metaTitle
      referenceLabel
      sectionDisplayMode
      title
      updatedAt
      displayDate
      dismissalProcess
      contents(order_by: { order: asc }) {
        id
        name
        title
        referenceLabel
        order
        blocks(order_by: { order: asc }) {
          id
          content
          order
          type
          contentDisplayMode
          infographic {
            svgFile {
              url
              altText
            }
            pdfFile {
              id
              url
              altText
              size
            }
          }
          contents(order_by: { order: asc }) {
            id
            document {
              cdtnId: cdtn_id
              source
              title
              slug
            }
          }
        }
        references(order_by: { order: asc }) {
          id
          url
          type
          title
          order
        }
      }
      references(order_by: { order: asc }) {
        id
        url
        type
        title
        order
      }
    }
  }
`;

export type InformationsRequest = {
  id: string;
};

export type InformationsResponse = {
  information_informations: Information[];
};
