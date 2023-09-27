import { z } from "zod";

export const referenceSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z.string(),
  type: z.string(),
  title: z.string(),
  order: z.number().nullable().optional(),
});
export type Reference = z.infer<typeof referenceSchema>;

export const fileSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z.string(),
  altText: z.string(),
  size: z.string(),
});
export type File = z.infer<typeof fileSchema>;

export const informationContentBlockContentSchema = z.object({
  document: z.object({
    cdtnId: z.string(),
    source: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
});
export type InformationContentBlockContent = z.infer<
  typeof informationContentBlockContentSchema
>;

export const informationContentBlockSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  content: z.string(),
  type: z.string(),
  contentDisplayMode: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  file: fileSchema.nullable().optional(),
  contents: z.array(informationContentBlockContentSchema).nullable().optional(),
});
export type InformationContentBlock = z.infer<
  typeof informationContentBlockSchema
>;

export const informationContentSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().nullable().optional(),
  title: z.string(),
  referenceLabel: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  blocks: z.array(informationContentBlockSchema),
  references: z.array(referenceSchema).nullable().optional(),
});
export type InformationContent = z.infer<typeof informationContentSchema>;

export const informationSchema = z.object({
  id: z.string().uuid().optional(),
  cdtnId: z.string(),
  description: z.string(),
  intro: z.string(),
  metaDescription: z.string(),
  metaTitle: z.string(),
  referenceLabel: z.string().nullable().optional(),
  sectionDisplayMode: z.string().optional(),
  dismissalProcess: z.boolean(),
  title: z.string(),
  updatedAt: z.string(),
  contents: z.array(informationContentSchema),
  references: z.array(referenceSchema),
});
export type Information = z.infer<typeof informationSchema>;
