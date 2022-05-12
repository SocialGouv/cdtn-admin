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
mutation updateOneExportEsStatus($id: uuid!, $status: String!, $updated_at: timestamptz) {
  update_export_es_status_by_pk(pk_columns: {id: $id}, _set: {status: $status, updated_at: $updated_at}) {
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

export const updateExportEsStatus = `
mutation updateExportEsStatus($old_status: String!, $new_status: String!, $updated_at: timestamptz) {
  update_export_es_status(
    where: {status: {_eq: $old_status }}
    _set: {status: $new_status, updated_at: $updated_at}) {
    returning {
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
}`;
