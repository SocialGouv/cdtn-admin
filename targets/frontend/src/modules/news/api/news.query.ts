import { gql } from "urql";
import { News } from "../type";

export const selectNewsQuery = gql`
  query SelectNews($id: uuid!) {
    news: news_news_by_pk(id: $id) {
      id
      title
      metaTitle
      content
      metaDescription
      createdAt
      updatedAt
      displayDate
      cdtnReferences: news_cdtn_references {
        document {
          cdtnId: cdtn_id
          title
          source
          slug
        }
      }
    }
  }
`;

export type NewsRequest = {
  id: string;
};

export type NewsResponse = {
  news: News;
};
