import { gql } from "urql";

export const getContributionAnswerById = gql`
  query contribution_answer($id: uuid!) {
    contribution_answers_by_pk(id: $id) {
      id
      content
      description
      content_type
      updatedAt: updated_at
      display_date
      cdtnId
      agreement {
        id
        name
        kali_id
      }
      question {
        id
        content
        order
        seo_title
      }
      message_block_generic_no_CDT
      kali_references {
        label
        kali_article {
          id
          path
          cid
          label
        }
      }
      legi_references {
        legi_article {
          id
          label
          cid
        }
      }
      other_references {
        label
        url
      }
      cdtn_references {
        cdtn_id
      }
      infographics {
        infographicId
      }
      content_fiche_sp: document_fiche_sp {
        initial_id
        document
      }
    }
  }
`;

export const getGenericAnswerByQuestionId = gql`
  query contribution_answer_generic($questionId: uuid!) {
    contribution_answers(
      where: {
        question_id: { _eq: $questionId }
        agreement_id: { _eq: "0000" }
      }
    ) {
      id
      content
      content_type
      question {
        id
        content
        order
        seo_title
      }
      content_fiche_sp: document_fiche_sp {
        initial_id
        document
      }
    }
  }
`;

export const getAllContributionsByQuestionId = gql`
  query allContributions($questionId: uuid!) {
    contribution_answers(where: { question_id: { _eq: $questionId } }) {
      id
      statuses(order_by: { created_at: desc }, limit: 1) {
        status
      }
    }
  }
`;
