import { gql } from "@urql/core";

export const contributionAnswerPublishMutation = gql`
  mutation publishAnswer(
    $answerId: uuid
    $initialId: String
    $document: jsonb
    $slug: String
    $text: String
    $title: String
    $metaDescription: String
  ) {
    update_documents(
      where: { initial_id: { _eq: $initialId } }
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
    insert_contribution_answer_statuses_one(
      object: { answer_id: $answerId, status: "PUBLISHED" }
    ) {
      id
    }
  }
`;

export type ContributionAnswerPublishRequest = {
  answerId: string;
  initialId: string;
  document: string;
  slug: string;
  text: string;
  title: string;
  metaDescription: string;
};

export type ContributionAnswerPublishResponse = {
  insert_contribution_answer_statuses_one: {
    id: string;
  };
};
