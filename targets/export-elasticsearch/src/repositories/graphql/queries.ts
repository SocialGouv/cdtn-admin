export const getExportEsStatusById = `
query getExportEsStatusById($id: uuid!) {
  export_es_status_by_pk(id: $id) {
    id
    environment
    status
    user_id
    user {
      name
      email
      created_at
    }
    created_at
    updated_at
  }
}`;

export const getAllExport = `
query getAllExport {
  export_es_status(order_by: {updated_at: desc}) {
    id
    environment
    status
    user_id
    user {
      name
      email
      created_at
    }
    created_at
    updated_at
  }
}`;

export const getExportEsStatusByEnvironments = `
query getExportEsStatusByEnvironments($environment: String!) {
  export_es_status(where: {environment: {_eq: $environment}}) {
    id
    environment
    status
    user_id
    user {
      name
      email
      created_at
    }
    created_at
    updated_at
  }
}`;

export const getLatestExportEsStatus = `
query getLatestExportEsStatus($environment: String!) {
  export_es_status(where: {environment: {_eq: $environment}}, order_by: {created_at: desc}) {
    id
    environment
    status
    user_id
    user {
      name
      email
      created_at
    }
    created_at
    updated_at
  }
}
`;

export const getExportEsStatusByStatus = `
query getExportEsStatusByStatus($status: String!) {
  export_es_status(where: {status: {_eq: $status}}) {
    id
    environment
    status
    user_id
    user {
      name
      email
      created_at
    }
    created_at
    updated_at
  }
}`;

export const getDocumentsUpdatedGte = `
query GetDocumentsUpdatedGte($date: timestamptz!, $source: [String!]!) {
  documents(where: {updated_at: {_gte: $date}, source: {_in: $source}}) {
    title
    updated_at
    text
    slug
    source
    cdtn_id
    created_at
    initial_id
    is_available
    is_searchable
    meta_description
    is_published
  }
}
`;
