export const getStatusPipeline = `
query coundDocumentsBySource($source:[String!]){
  documents_aggregate(where: {is_available: {_eq: true}, source: {_in: $source}}){
    aggregate {
      count
    }
  }
}`;
