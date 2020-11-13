export const getAllDocumentsBySourceQuery = `
query getAllDocumentsBySource($source: String!, $limit:Int=10,$offset:Int=0 ) {
  documents(
    order_by: {cdtn_id: asc},
    limit: $limit
    offset: $offset
    where: {is_available: {_eq: true}, source: {_eq: $source}}) {
    id:initial_id
    cdtnId:cdtn_id
    title
    source
    document
  }
}
`;

export const countDocumentsBySourceQuery = `
query coundDocumentsBySource($source:String!){
  documents_aggregate(where: {is_available: {_eq: true}, source: {_eq: $source}}){
    aggregate {
      count
    }
  }
}`;
