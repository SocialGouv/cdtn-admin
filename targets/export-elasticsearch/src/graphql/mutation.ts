export const createExportEsStatus = `
mutation createExportEsStatus($id: uuid!, $userId: uuid!, $environment: String!, $status: String!) {
  insert_export_es_status_one(object: {id: $id, user_id: $userId, environment: $environment, status: $status}) {
    id
    environment
    status
    user_id
    created_at
    updated_at
  }
}`;

export const updateExportEsStatus = `
mutation updateExportEsStatus($id: uuid!, $status: String!, $updated_at: timestamptz) {
  update_export_es_status_by_pk(pk_columns: {id: $id}, _set: {status: $status, updated_at: $updated_at}) {
    id
    environment
    status
    user_id
    created_at
    updated_at
  }
}`;
