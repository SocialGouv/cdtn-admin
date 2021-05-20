import type { HasuraDocument } from "@shared/types";

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

export type HasuraDocumentForAlert = Pick<
  HasuraDocument,
  "document" | "source" | "title"
> & {
  id: string;
  cdtnId: string;
};

export type AllDocumentsBySourceResult = {
  documents: HasuraDocumentForAlert[];
};

export const countDocumentsBySourceQuery = `
query coundDocumentsBySource($source:String!){
  documents_aggregate(where: {is_available: {_eq: true}, source: {_eq: $source}}){
    aggregate {
      count
    }
  }
}`;

export type CountDocumentsBySourceResult = {
  documents_aggregate: {
    aggregate: {
      count: number;
    };
  };
};
