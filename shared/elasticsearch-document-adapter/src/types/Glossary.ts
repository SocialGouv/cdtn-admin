import type { Breadcrumbs } from "../breadcrumbs";
import type { GraphQLResponseRoot } from "./GraphQL";

export type DocumentBySourceResponse = GraphQLResponseRoot<Data>;
export type RequestBySourceResponse = GraphQLResponseRoot<Data>;
export type RequestBySourceWithRelationsResponse =
  GraphQLResponseRoot<RequestBySourceWithRelationsData>;
export type GetGlossaryResponse = GraphQLResponseRoot<GetGlossaryData>;

export type GetGlossaryData = {
  glossary: GlossaryResponse[];
};

export type GlossaryResponse = {
  term: string;
  abbreviations: string[];
  definition: string;
  variants: string[];
  references: undefined[] | string;
  slug: string;
};

export type Data = {
  documents: Document[];
};

export type Document = {
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
};

export type DocumentElasticWithSource<T> = DocumentElastic & T;

export type DocumentElastic = {
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
};

export type AggregateDocumentBySource = GraphQLResponseRoot<{
  documents_aggregate: {
    aggregate: {
      count: number;
    };
  };
}>;

export type DocumentRef = {
  breadcrumbs: Breadcrumbs[];
  cdtnId: string;
  description: string;
  slug: string;
  source: string;
  title: string;
  url: string | undefined;
};

export type RequestBySourceWithRelationsData = {
  documents: DocumentWithRelation[];
};

export type DocumentWithRelation = {
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
};

export type Relation = {
  content: RelationContent;
  position: number;
};

export type RelationContent = {
  cdtnId: string;
  slug: string;
  source: string;
  title: string;
  document: unknown;
};
