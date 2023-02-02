import { z } from "zod";
import {
  BlockDisplayMode,
  CONTENT_TYPE,
  SectionDisplayMode,
} from "./EditorialContentTypes";

export const GraphicContentPartSchema = z.object({
  altText: z.string(),
  fileUrl: z.string(),
  imgUrl: z.string(),
  markdown: z.string(),
  size: z.string(),
  type: z.literal(CONTENT_TYPE.graphic),
});

export const MarkdownContentPartSchema = z.object({
  markdown: z.string(),
  type: z.literal(CONTENT_TYPE.markdown),
});

export const ContentItemSchema = z.object({
  cdtnId: z.string(),
  source: z.string(),
  title: z.string(),
});

export const ContentContentPartSchema = z.object({
  blockDisplayMode: z.nativeEnum(BlockDisplayMode),
  contents: z.array(ContentItemSchema),
  title: z.string().optional(),
  type: z.literal(CONTENT_TYPE.content),
});

export const EditorialContentPartSchema = z.union([
  GraphicContentPartSchema,
  MarkdownContentPartSchema,
  ContentContentPartSchema,
]);

export const EditorialContentLinkSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  url: z.string(),
});

export const EditoralContentReferenceBlocSchema = z.object({
  label: z.string(),
  links: z.array(EditorialContentLinkSchema),
});

export const BaseContentPartSchema = z.object({
  blocks: z.array(EditorialContentPartSchema),
  name: z.string(),
  references: z.array(EditoralContentReferenceBlocSchema),
  title: z.string(),
});

export const EditorialContentDocSchema = z.object({
  date: z.string(),
  intro: z.string(),
  description: z.string(),
  sectionDisplayMode: z.nativeEnum(SectionDisplayMode).optional(),
  dismissalProcess: z.boolean().optional(),
  contents: z.array(BaseContentPartSchema),
  references: z.array(EditoralContentReferenceBlocSchema).optional(),
});
