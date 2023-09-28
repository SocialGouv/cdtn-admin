import { z } from "zod";

export const referenceSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z.string({ required_error: "une url doit être renseigner" }),
  type: z.string({ required_error: "un type doit être renseigner" }),
  title: z.string({ required_error: "un titre doit être renseigner" }),
  order: z.number().nullable().optional(),
});
export type Reference = z.infer<typeof referenceSchema>;

export const fileSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z
    .string({ required_error: "une url doit être renseigner" })
    .min(1, "une url doit être renseigner")
    .url("Le format doit correspondre à une url"),
  altText: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
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
  type: z.string({ required_error: "un type doit être renseigner" }),
  contentDisplayMode: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  file: fileSchema.nullable().optional(),
  img: fileSchema.nullable().optional(),
  contents: z.array(informationContentBlockContentSchema).nullable().optional(),
});
export type InformationContentBlock = z.infer<
  typeof informationContentBlockSchema
>;

export const informationContentSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().nullable().optional(),
  title: z
    .string({ required_error: "un titre doit être renseigner" })
    .min(1, "un titre doit être renseigner"),
  referenceLabel: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  blocks: z.array(informationContentBlockSchema),
  references: z.array(referenceSchema).nullable().optional(),
});
export type InformationContent = z.infer<typeof informationContentSchema>;

export const informationSchema = z.object({
  id: z.string().uuid().optional(),
  cdtnId: z.string().nullable().optional(),
  title: z
    .string({ required_error: "un titre doit être renseigner" })
    .min(1, "un titre doit être renseigner"),
  metaTitle: z
    .string({ required_error: "un titre meta doit être renseigner" })
    .min(1, "un titre meta doit être renseigner"),
  description: z
    .string({
      required_error: "une description doit être renseigner",
    })
    .min(1, "une description doit être renseigner"),
  metaDescription: z
    .string({
      required_error: "une description meta doit être renseigner",
    })
    .min(1, "une description meta doit être renseigner"),
  intro: z.string().nullable().optional(),
  referenceLabel: z.string().nullable().optional(),
  sectionDisplayMode: z.string().optional(),
  dismissalProcess: z.boolean(),
  updatedAt: z.string().nullable().optional(),
  contents: z.array(informationContentSchema),
  references: z.array(referenceSchema),
});
export type Information = z.infer<typeof informationSchema>;
