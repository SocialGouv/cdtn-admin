export const createExportEsStatus = `
mutation createExportEsStatus($id: uuid!, $user_id: uuid!, $environment: String!, $status: String!) {
  insert_export_es_status_one(object: {id: $id, user_id: $user_id, environment: $environment, status: $status}) {
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

export const updateOneExportEsStatus = `
mutation updateOneExportEsStatus($id: uuid!, $status: String!, $updated_at: timestamptz, $error: String) {
  update_export_es_status_by_pk(pk_columns: {id: $id}, _set: {status: $status, updated_at: $updated_at, error: $error}) {
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
    error
  }
}`;
