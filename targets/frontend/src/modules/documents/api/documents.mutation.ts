export const documentsPublishMutation = `
  mutation publish_document($upsert: documents_insert_input!) {
    insert_documents_one(
      object: $upsert,
      on_conflict: {
        constraint: documents_pkey
        update_columns: [
          initial_id
          document
          text
          title
          meta_description
          slug
          source
          is_searchable
          is_available
        ]
      }
    ) {
      cdtn_id
    }
  }
`;

export const documentsDeleteMutation = `
  mutation delete_document($id: String!) {
    delete_documents(where: {initial_id: {_eq: $id}}) {
        affected_rows
      }
  }
`;
