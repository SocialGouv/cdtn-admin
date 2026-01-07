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

export const documentsDeleteByCdtnIdMutation = `
  mutation delete_document_by_cdtn_id($cdtnId: String!) {
    delete_documents_by_pk(cdtn_id: $cdtnId) {
      cdtn_id
    }
  }
`;

export const documentsDeleteBySourceAndInitialIdMutation = `
  mutation delete_document_by_source_and_initial_id(
    $source: String!
    $initialId: String!
  ) {
    delete_documents(
      where: { source: { _eq: $source }, initial_id: { _eq: $initialId } }
    ) {
      affected_rows
    }
  }
`;
