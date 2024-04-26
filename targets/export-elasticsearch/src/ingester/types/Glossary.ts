import { Breadcrumbs } from "@socialgouv/cdtn-types";
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
  source: string;
  text: string;
  isPublished: boolean;
  isSearchable: boolean;
  metaDescription: string;
  document: unknown;
}

export type DocumentElasticWithSource<T> = DocumentElastic & T;

export interface DocumentElastic {
  id: string;
  cdtnId: string;
  breadcrumbs: Breadcrumbs[];
  title: string;
  slug: string;
  source: string;
  text: string;
  isPublished: boolean;
  excludeFromSearch: boolean;
  metaDescription: string;
  refs: DocumentRef[];
}

export type AggregateDocumentBySource = GraphQLResponseRoot<{
  documents_aggregate: {
    aggregate: {
      count: number;
    };
  };
}>;

export interface DocumentRef {
  breadcrumbs: Breadcrumbs[];
  cdtnId: string;
  description: string;
  slug: string;
  source: string;
  title: string;
  url: string | undefined;
}

export interface RequestBySourceWithRelationsData {
  documents: DocumentWithRelation[];
}

export interface DocumentWithRelation {
  id: string;
  cdtnId: string;
  title: string;
  slug: string;
  source: string;
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
  source: string;
  title: string;
  document: unknown;
}
