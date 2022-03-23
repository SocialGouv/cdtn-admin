export const getExportEsStatusById = `
query getExportEsStatusById($id: uuid!) {
  export_es_status_by_pk(id: $id) {
    id
    environment
    status
    user_id
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
    created_at
    updated_at
  }
}`;

export const getExportEsStatusByStatus = `
query getExportEsStatusByStatus($status: String!) {
  export_es_status(where: {status: {_eq: $status}}) {
    id
    environment
    status
    user_id
    created_at
    updated_at
  }
}`;
