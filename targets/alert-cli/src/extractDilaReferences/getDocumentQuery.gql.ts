import type { HasuraDocument } from "@shared/types";

export const getAllDocumentsBySourceQuery = `
query getAllDocumentsBySource($source: String!, $limit:Int=10,$offset:Int=0 ) {
  documents(
    order_by: {cdtn_id: asc},
    limit: $limit
    offset: $offset
    where: {is_available: {_eq: true}, source: {_eq: $source}}) {
    initialId: initial_id 
    cdtnId: cdtn_id
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
  initialId: string;
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

export const getAllDocumentsWithRelationsBySourceQuery = `
query($source: String!, $limit:Int=10,$offset:Int=0 ) {

  documents(
    order_by: {cdtn_id: asc}
    limit: $limit
    offset: $offset
    where: {source: {_eq: $source},  is_available: {_eq: true} }
  ) { 
    cdtnId:cdtn_id
    title 
    isPublished: is_published 
    contentRelations: relation_a(where: {type: {_eq: "document-content"}}) {
      position: data(path: "position")
      document: b { 
        initialId: initial_id
        slug
        source
        title 
      }
    }
  }
}
`;
export type HasuraDocumentWithRelations = Pick<HasuraDocument, "title"> & {
  cdtnId: string;
  contentRelations: {
    position: number;
    document: Pick<HasuraDocument, "slug" | "source" | "title"> & {
      initialId: string;
    };
  }[];
};
export type AllDocumentsWithRelationBySourceResult = {
  documents: HasuraDocumentWithRelations[];
};
