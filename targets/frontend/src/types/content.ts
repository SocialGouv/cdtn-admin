export type ContentLink = {
  id: string;
  key: string;
  title: string;
  type: string;
  url: string;
};

export type ContentSectionReference = {
  key: string;
  label: string;
  links: ContentLink[];
};

export enum SECTION_TYPES {
  GRAPHIC = "graphic",
  MARKDOWN = "markdown",
}

export type ContentSection = {
  key?: string;
  markdown?: string;
  name?: string;
  title?: string;
  type: SECTION_TYPES;
  references?: ContentSectionReference[];
};

export type ContentDocumentReference = {
  title: string;
  url: string;
  key: string;
  links: ContentLink[];
};

export type ContentDocument = {
  contents?: ContentSection[];
  metaDescription?: string;
  date?: string;
  description?: string;
  intro?: string;
  isTab?: boolean;
  key?: string;
  references?: ContentDocumentReference[];
};

export type ContentRelation = {
  relationId: string;
  cdtnId?: string;
};

export type Content = {
  cdtnId?: string;
  contentRelations?: any[];
  document?: ContentDocument;
  metaDescription?: string;
  slug?: string;
  source?: string;
  title?: string;
  text?: string;
  isPublished?: boolean;
  isSearchable?: boolean;
  isAvailable?: boolean;
  contents?: ContentRelation[];
};

export type ContentQuery = {
  content: Content;
};

export type ContentUpdateMutation = {
  cdtnId?: string;
  content_relations?: any[];
  document?: ContentDocument;
  meta_description?: string;
  slug?: string;
  source?: string;
  title?: string;
  text?: string;
  is_published?: boolean;
  is_searchable?: boolean;
  is_available?: boolean;
  contents?: ContentRelation[];
};
