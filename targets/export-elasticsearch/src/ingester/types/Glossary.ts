import { SourceKeys } from "@socialgouv/cdtn-utils";
import type { GraphQLResponseRoot } from "./GraphQL";

export type DocumentBySourceResponse = GraphQLResponseRoot<Data>;
export type RequestBySourceResponse = GraphQLResponseRoot<Data>;
export type RequestBySourceWithRelationsResponse =
  GraphQLResponseRoot<RequestBySourceWithRelationsData>;
export type GetGlossaryResponse = GraphQLResponseRoot<GetGlossaryData>;

export interface GetGlossaryData {
  glossary: GlossaryResponse[];
}

export interface GlossaryResponse {
  term: string;
  abbreviations: string[];
  definition: string;
  variants: string[];
  references: undefined[] | string;
  slug: string;
}

export interface Data {
  documents: Document[];
}

export interface Document {
  id: string;
  cdtnId: string;
  title: string;
  slug: string;
  source: SourceKeys;
  text: string;
  isPublished: boolean;
  isSearchable: boolean;
  metaDescription: string;
  document: unknown;
}

export type AggregateDocumentBySource = GraphQLResponseRoot<{
  documents_aggregate: {
    aggregate: {
      count: number;
    };
  };
}>;

export interface RequestBySourceWithRelationsData {
  documents: DocumentWithRelation[];
}

export interface DocumentWithRelation {
  id: string;
  cdtnId: string;
  title: string;
  slug: string;
  source: SourceKeys;
  text: string;
  isPublished: boolean;
  isSearchable: boolean;
  metaDescription: string;
  document: unknown;
  contentRelations: Relation[];
}

export interface Relation {
  content: RelationContent;
  position: number;
}

export interface RelationContent {
  cdtnId: string;
  slug: string;
  source: SourceKeys;
  title: string;
  document: unknown;
}
