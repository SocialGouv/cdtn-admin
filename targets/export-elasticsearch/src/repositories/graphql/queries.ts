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

export const getDocumentBySource = `
query getDocumentBySource($source: String!) {
  documents(where: {source: {_eq: $source},  is_available: {_eq: true} }) {
    id: initial_id
    cdtnId: cdtn_id
    title
    slug
    source
    text
    isPublished: is_published
    isSearchable: is_searchable
    metaDescription: meta_description
    document
  }
}`;
