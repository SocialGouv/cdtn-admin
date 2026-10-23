import { gql } from "urql";

export const updateNewsPublicationMutation = gql`
  mutation news_publication(
    $id: uuid!
    $displayDate: date!
    $publishedAt: timestamptz!
  ) {
    update_news_news_by_pk(
      pk_columns: { id: $id }
      _set: { displayDate: $displayDate, publishedAt: $publishedAt }
    ) {
      id
    }
  }
`;
