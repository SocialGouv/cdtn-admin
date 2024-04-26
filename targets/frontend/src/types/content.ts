import {
  EditorialContentBaseContentPart,
  EditoralContentReferenceBloc,
  EditorialContent,
  EditorialContentDoc,
  EditorialContentLink,
  GraphicContentPart,
  Highlight,
  KeysToCamelCase,
  MarkdownContentPart,
  Prequalified,
} from "@socialgouv/cdtn-types";

export * from "@socialgouv/cdtn-types";

export type PrequalifiedContent = Prequalified & {
  contentRelations: ContentRelation[];
  cdtnId?: number;
};
export type HighLightContent = KeysToCamelCase<Highlight> & {
  contentRelations: ContentRelation[];
  cdtnId?: number;
};

export type ImageSectionContent = GraphicContentPart & {
  key: string;
};

export type TextSectionContent = MarkdownContentPart & {
  key: string;
};

export type BlockSectionContent = ImageSectionContent | TextSectionContent;

export type ContentSection = EditorialContentBaseContentPart & {
  key: string;
};

export type ContentDocument = KeysToCamelCase<EditorialContentDoc> & {
  metaDescription?: string;
  contents: any;
  dismissalProcess?: boolean;
};
export type ContentSectionReference =
  KeysToCamelCase<EditoralContentReferenceBloc> & { key?: string };
export type ContentLink = KeysToCamelCase<EditorialContentLink> & {
  key?: string;
};
export type ContentRelation = {
  relationId: string;
  cdtnId?: string;
  position?: number;
  content: {
    cdtnId?: string;
  };
};
export type Content = KeysToCamelCase<Omit<EditorialContent, "document">> & {
  contents: ContentRelation[];
  document: Partial<ContentDocument>;
  contentRelations: ContentRelation[];
  dismissalProcess?: boolean;
};

export type ContentQuery = {
  content: Content | PrequalifiedContent | HighLightContent;
};

export type ContentUpdateMutation = {
  cdtnId?: string;
  content_relations?: any[];
  document?: ContentDocument;
  meta_description?: string;
  dismissalProcess?: boolean;
  slug?: string;
  source?: string;
  title?: string;
  text?: string;
  is_published?: boolean;
  is_searchable?: boolean;
  is_available?: boolean;
  contents?: ContentRelation[];
};
