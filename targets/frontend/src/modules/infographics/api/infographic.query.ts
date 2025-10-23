import { gql } from "urql";
import { Infographic } from "../type";

export const infographicsQuery = gql`
  query SelectInfographic($id: uuid!) {
    infographic: infographic_infographic_by_pk(id: $id) {
      id
      title
      metaTitle
      description
      metaDescription
      transcription
      createdAt
      updatedAt
      displayDate
      svgFile {
        id
        url
        size
        altText
      }
      pdfFile {
        id
        url
        size
        altText
      }
    }
  }
`;

export type InfographicRequest = {
  id: string;
};

export type InfographicResponse = {
  infographic: Infographic;
};
