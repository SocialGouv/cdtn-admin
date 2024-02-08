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
  }
}`;

export const listSupportedAgreements = `
query ListSupportedAgreements {
  agreements: agreement_agreements(where: {id: {_neq: "0000"}, isSupported: {_eq: true}}) {
    id: kali_id
    url: legifranceUrl
    title: name
    date_publi: publicationDate
    texte_de_base: rootText
    shortTitle: shortName
    effectif: workerNumber
    fetchArticles: isSupported
    num: id
  }
}
`;
