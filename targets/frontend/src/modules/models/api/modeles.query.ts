import { gql } from "@urql/core";
import { Model } from "../type";

export const modelesQuery = gql`
  query SelectModel($id: uuid!) {
    model: model_models_by_pk(id: $id) {
      id
      title
      metaTitle
      type
      description
      metaDescription
      previewHTML
      createdAt
      updatedAt
      file {
        id
        url
        size
        altText
      }
      legiReferences: models_legi_references {
        legiArticle {
          cid
          id
          label
        }
      }
      otherReferences: models_other_references {
        id
        label
        url
      }
    }
  }
`;

export type ModelRequest = {
  id: string;
};

export type ModelResponse = {
  model: Model;
};
