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
      id
    }
    created_at
    updated_at
    error
    documentsCount
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
      id
    }
    created_at
    updated_at
    error
    documentsCount
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
      id
    }
    created_at
    updated_at
    error
    documentsCount
  }
}
`;

export const getLatestCompletedExportEsStatus = `
query getLatestCompletedExportEsStatus($environment: String!) {
  export_es_status(where: {environment: {_eq: $environment}, status: {_eq: "completed"}}, order_by: {created_at: desc}) {
    id
    environment
    status
    user_id
    user {
      name
      email
      id
    }
    created_at
    updated_at
    error
    documentsCount
  }
}
`;

export const getExportEsStatusById = `
query getExportEsById($id: uuid!) {
  export_es_status_by_pk(id: $id) {
    id
    environment
    status
    user_id
    user {
      name
      email
      id
    }
    created_at
    updated_at
    error
    documentsCount
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
      id
    }
    created_at
    updated_at
    error
    documentsCount
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

export const getGlossaryQuery = `
  query Glossary {
    glossary {
      term
      abbreviations
      definition
      variants
      references
      slug
    }
  }
`;

export const fetchDocumentQuery = `
query fetchDocument($source: String) {
  documents(where: {source: {_eq: $source}}) {
    cdtn_id
    document
  }
}
`;

export const getAccordsCountQuery = `
  query accords_count($today: date!) {
    accords_aggregate: accords_accords_aggregate(
      where: { date_fin: { _gt: $today } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const getAccordsQuery = `
  query accords($limit: Int!, $offset: Int!, $today: date!) {
    accords: accords_accords(
      where: { date_fin: { _gt: $today } }
      limit: $limit
      offset: $offset
      order_by: { id: asc }
    ) {
      id
      title
      siret
      date_maj
      date_depot
      date_effet
      date_fin
      date_diffusion
      conforme_version_integrale
      themes
      signataires
    }
  }
`;
