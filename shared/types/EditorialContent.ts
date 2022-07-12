import { BaseHasuraDocument } from "./Base";

export enum CONTENT_TYPE {
  markdown = "markdown",
  graphic = "graphic",
}

export type BaseContentPart = {
  name: string;
  title: string;
  references: EditoralContentReferenceBloc[];
  type: CONTENT_TYPE;
  blocks: EditorialContentPart[];
};

export type MarkdownContentPart = {
  type: CONTENT_TYPE.markdown;
  markdown: string;
};

export type EditorialContentPart = GraphicContentPart | MarkdownContentPart;

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
  contents: EditorialContentPart[];
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
