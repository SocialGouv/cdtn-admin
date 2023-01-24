import {
  BlockDisplayMode,
  CONTENT_TYPE,
  SectionDisplayMode,
} from "@shared/types";
import { NextApiRequest, NextApiResponse } from "next";
import { commandService, UpdateInformationPage } from "src/lib";
import { z } from "zod";

const GraphicContentPartSchema = z.object({
  altText: z.string(),
  fileUrl: z.string(),
  imgUrl: z.string(),
  markdown: z.string(),
  size: z.string(),
  type: z.literal(CONTENT_TYPE.graphic),
});

const MarkdownContentPartSchema = z.object({
  markdown: z.string(),
  type: z.literal(CONTENT_TYPE.markdown),
});

const ContentItemSchema = z.object({
  cdtnId: z.string(),
  source: z.string(),
  title: z.string(),
});

const ContentContentPartSchema = z.object({
  blockDisplayMode: z.nativeEnum(BlockDisplayMode),
  contents: z.array(ContentItemSchema),
  title: z.string().optional(),
  type: z.literal(CONTENT_TYPE.content),
});

const EditorialContentPartSchema = z.union([
  GraphicContentPartSchema,
  MarkdownContentPartSchema,
  ContentContentPartSchema,
]);

const EditorialContentLinkSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  url: z.string(),
});

const EditoralContentReferenceBlocSchema = z.object({
  label: z.string(),
  links: z.array(EditorialContentLinkSchema),
});

const BaseContentPartSchema = z.object({
  blocks: z.array(EditorialContentPartSchema),
  name: z.string(),
  references: z.array(EditoralContentReferenceBlocSchema),
  title: z.string(),
});

const EditorialContentDocSchema = z.object({
  contents: z.array(BaseContentPartSchema),
  date: z.string(),
  description: z.string(),
  dismissalProcess: z.boolean().optional(),
  intro: z.string(),
  references: z.array(EditoralContentReferenceBlocSchema).optional(),
  section_display_mode: z.nativeEnum(SectionDisplayMode).optional(),
});

const InputData = z.object({
  cdtnId: z.string(),
  document: EditorialContentDocSchema,
  metaDescription: z.string(),
  slug: z.string(),
  title: z.string(),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const bearer = req.headers.authorization;
    const result = InputData.parse(req.body);
    const command = new UpdateInformationPage(
      bearer,
      result.cdtnId,
      result.metaDescription,
      result.slug,
      result.title,
      result.document
    );
    try {
      await commandService.execute(command);
      res.status(202).send({ success: "OK" });
    } catch (e: unknown) {
      res.status(500).send({ error: (e as any).message });
    }
  }
};
