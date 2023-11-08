import { gql } from "@urql/core";

export const getContributionAnswerById = gql`
  query contribution_answer($id: uuid!) {
    contribution_answers_by_pk(id: $id) {
      id
      content
      content_type
      question_id
      agreement {
        id
        name
      }
      question {
        content
        order
      }
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
        document {
          title
          source
          slug
        }
      }
      content_fiche_sp: document {
        document
      }
    }
  }
`;
