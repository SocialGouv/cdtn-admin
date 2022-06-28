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

export enum DOCUMENT_SOURCE {
  fiches_ministere_travail = "fiches_ministere_travail",
  contributions = "contributions",
  code_du_travail = "code_du_travail",
  fiches_service_public = "fiches_service_public",
  conventions_collectives = "conventions_collectives",
  prequalified = "prequalified",
  themes = "themes",
  modeles_de_courriers = "modeles_de_courriers",
  information = "information",
  highlight = "highlight",
}

export type Prequalified = BaseHasuraDocument & {
  source: DOCUMENT_SOURCE.prequalified;
  document: PrequalifiedDoc;
};

export type Highlight = BaseHasuraDocument & {
  source: DOCUMENT_SOURCE.highlight;
};

export type EditorialContent = BaseHasuraDocument & {
  source: DOCUMENT_SOURCE.information;
  document: EditorialContentDoc;
};
