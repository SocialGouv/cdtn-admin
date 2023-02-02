import { BaseHasuraDocument } from "./Base";
import { z } from "zod";
import {
  BaseContentPartSchema,
  ContentContentPartSchema,
  ContentItemSchema,
  EditoralContentReferenceBlocSchema,
  EditorialContentDocSchema,
  EditorialContentLinkSchema,
  EditorialContentPartSchema,
  GraphicContentPartSchema,
  MarkdownContentPartSchema,
} from "./EditorialContentSchema";

export enum CONTENT_TYPE {
  markdown = "markdown",
  graphic = "graphic",
  content = "content",
}

export declare enum BlockDisplayMode {
  line = "line",
  square = "square",
}

export enum SectionDisplayMode {
  accordion = "accordion",
  tab = "tab",
}

export type BaseContentPart = z.infer<typeof BaseContentPartSchema>;

export type MarkdownContentPart = z.infer<typeof MarkdownContentPartSchema>;

export type ContentItem = z.infer<typeof ContentItemSchema>;

export type ContentContentPart = z.infer<typeof ContentContentPartSchema>;

export type EditorialContentPart = z.infer<typeof EditorialContentPartSchema>;

export type EditorialContentLink = z.infer<typeof EditorialContentLinkSchema>;

export type EditoralContentReferenceBloc = z.infer<
  typeof EditoralContentReferenceBlocSchema
>;

export type GraphicContentPart = z.infer<typeof GraphicContentPartSchema>;

export type EditorialContentDoc = z.infer<typeof EditorialContentDocSchema>;

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
