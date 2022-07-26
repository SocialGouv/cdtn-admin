import { BaseHasuraDocument } from "./Base";

export enum CONTENT_TYPE {
  markdown = "markdown",
  graphic = "graphic",
  content = "content",
}

export declare enum BlockDisplayMode {
  line = "line",
  square = "square",
}

export type BaseContentPart = {
  name: string;
  title: string;
  references: EditoralContentReferenceBloc[];
  blocks: EditorialContentPart[];
};

export type MarkdownContentPart = {
  type: CONTENT_TYPE.markdown;
  markdown: string;
};

export type ContentItem = {
  title: string;
  source: string;
  cdtnId: string;
};

export type ContentContentPart = {
  type: CONTENT_TYPE.content;
  contents: ContentItem[];
  blockDisplayMode: BlockDisplayMode;
};

export type EditorialContentPart =
  | GraphicContentPart
  | MarkdownContentPart
  | ContentContentPart;

export type EditorialContentLink = {
  id: string;
  url: string;
  type: string;
  title: string;
};

export type EditoralContentReferenceBloc = {
  label: string;
  links: EditorialContentLink[];
};

export type GraphicContentPart = {
  type: CONTENT_TYPE.graphic;
  size: string;
  imgUrl: string;
  altText: string;
  fileUrl: string;
  markdown: string;
};

export enum SectionDisplayMode {
  accordion = "accordion",
  tab = "tab",
}

export type EditorialContentDoc = {
  date: string;
  intro: string;
  section_display_mode?: SectionDisplayMode;
  contents: BaseContentPart[];
  references?: EditoralContentReferenceBloc[];
  description: string;
};

export type PrequalifiedDoc = {
  variants: string[];
};

export type Prequalified = BaseHasuraDocument & {
  source: "prequalified";
  document: PrequalifiedDoc;
};

export type Highlight = BaseHasuraDocument & {
  source: "highlights";
};

export type EditorialContent = BaseHasuraDocument & {
  source: "information";
  document: EditorialContentDoc;
};
