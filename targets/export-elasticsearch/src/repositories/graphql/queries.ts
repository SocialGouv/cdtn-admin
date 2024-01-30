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
    error
    informations
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
    error
    informations
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
    error
    informations
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
    error
    informations
  }
}`;
