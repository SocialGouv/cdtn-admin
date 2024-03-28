declare module "@socialgouv/cdtn-elasticsearch" {
  export const createIndex: any;
  export const deleteOldIndex: any;
  export const documentMapping: any;
  export const DOCUMENTS: string;
  export const indexDocumentsBatched: any;
  export const SUGGESTIONS: string;
  export const vectorizeDocument: any;
  export const version: any;
  export const suggestionMapping: any;
}
