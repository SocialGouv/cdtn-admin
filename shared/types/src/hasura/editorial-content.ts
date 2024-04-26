import { HasuraDocument } from "./common";

export enum EditorialContentType {
  markdown = "markdown",
  graphic = "graphic",
  content = "content",
}

export enum EditorialContentBlockDisplayMode {
  line = "line",
  square = "square",
}

export type EditorialContentContent = {
  name: string;
  title: string;
  references?: EditoralContentReferenceBloc[];
  blocks: EditorialContentPart[];
};

export type MarkdownContentPart = {
  type: EditorialContentType.markdown;
  markdown: string;
};

export type ContentItem = {
  title: string;
  source: string;
  cdtnId: string;
};

export type ContentContentPart = {
  title?: string;
  type: EditorialContentType.content;
  contents: ContentItem[];
  blockDisplayMode: EditorialContentBlockDisplayMode;
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
  type: EditorialContentType.graphic;
  size: string;
  imgUrl: string;
  altText: string;
  fileUrl: string;
  markdown: string;
};

export enum EditorialSectionDisplayMode {
  accordion = "accordion",
  tab = "tab",
}

export type EditorialContentDoc = {
  date: string;
  intro: string;
  section_display_mode?: EditorialSectionDisplayMode;
  dismissalProcess?: boolean;
  contents: EditorialContentContent[];
  references?: EditoralContentReferenceBloc[];
  description: string;
};

export type EditorialContent = HasuraDocument<
  EditorialContentDoc,
  "information"
>;
