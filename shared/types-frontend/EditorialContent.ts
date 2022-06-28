import { BaseHasuraDocument } from "./Base";

export enum CONTENT_TYPE {
  markdown = "markdown",
  graphic = "graphic",
}

export interface BaseContentPart {
  name: string;
  title: string;
  markdown: string;
  references: EditoralContentReferenceBloc[];
  type: CONTENT_TYPE;
}

export interface MarkdownContentPart extends BaseContentPart {
  type: CONTENT_TYPE.markdown;
}

export type EditorialContentPart = GraphicContentPart | MarkdownContentPart;

export interface EditorialContentLink {
  id: string;
  url: string;
  type: string;
  title: string;
}

export interface EditoralContentReferenceBloc {
  label: string;
  links: EditorialContentLink[];
}

export interface GraphicContentPart extends BaseContentPart {
  type: CONTENT_TYPE.graphic;
  size: string;
  imgUrl: string;
  altText: string;
  fileUrl: string;
}

export type EditorialContentDoc = {
  date: string;
  intro: string;
  section_display_mode?: string;
  contents: EditorialContentPart[];
  references?: EditoralContentReferenceBloc[];
  description: string;
};

type PrequalifiedDoc = {
  variants: string[];
};

export type Prequalified = BaseHasuraDocument & {
  source: "prequalified";
  document: PrequalifiedDoc;
};

export type Highlight = BaseHasuraDocument & {
  source: "highlight";
};

export type EditorialContent = BaseHasuraDocument & {
  source: "information";
  document: EditorialContentDoc;
};
