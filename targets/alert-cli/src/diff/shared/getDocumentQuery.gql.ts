import type { HasuraDocument } from "@shared/types";

export const getAllDocumentsBySourceQuery = `
query getAllDocumentsBySource($source: [String!], $limit:Int=10,$offset:Int=0 ) {
  documents(
    order_by: {cdtn_id: asc},
    limit: $limit
    offset: $offset
    where: {is_available: {_eq: true}, source: {_in: $source}}) {
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
  "source" | "title"
> & {
  initialId: string;
  cdtnId: string;
};

export interface AllDocumentsBySourceResult {
  documents: HasuraDocumentForAlert[];
}

export const countDocumentsBySourceQuery = `
query coundDocumentsBySource($source:[String!]){
  documents_aggregate(where: {is_available: {_eq: true}, source: {_in: $source}}){
    aggregate {
      count
    }
  }
}`;

export interface CountDocumentsBySourceResult {
  documents_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const getAllDocumentsWithRelationsBySourceQuery = `
query($source: [String!], $limit:Int=10,$offset:Int=0 ) {

  documents(
    order_by: {cdtn_id: asc}
    limit: $limit
    offset: $offset
    where: {source: {_in: $source},  is_available: {_eq: true} }
  ) {
    cdtnId:cdtn_id
    title
    source
    isPublished: is_published
    contentRelations: relation_a(where: {type: {_in: ["document-content", "theme-content"] }}) {
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

export type HasuraDocumentWithRelations = Pick<
  HasuraDocument,
  "source" | "title"
> & {
  cdtnId: string;
  isPublished: boolean;
  contentRelations: {
    position: number;
    document: Pick<HasuraDocument, "slug" | "source" | "title"> & {
      initialId: string;
    };
  }[];
};

export interface AllDocumentsWithRelationBySourceResult {
  documents: HasuraDocumentWithRelations[];
}
