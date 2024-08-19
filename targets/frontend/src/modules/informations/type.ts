import { z } from "zod";
import { fileSchema } from "../common/type";

export const referenceSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z
    .string({ required_error: "Une url doit être renseignée" })
    .url("Le format de l'url est invalide"),
  type: z.string({ required_error: "Un type doit être renseigné" }),
  title: z
    .string({ required_error: "Un titre doit être renseigné" })
    .min(1, "Un titre doit être renseigné"),
  order: z.number().nullable().optional(),
});
export type Reference = z.infer<typeof referenceSchema>;

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
  type: z.string({ required_error: "Un type doit être renseigné" }),
  order: z.number().nullable().optional(),
});

export const informationContentBlockDiscriminatedSchema = z.discriminatedUnion(
  "type",
  [
    informationContentBlockSchema.extend({
      type: z.literal("markdown"),
      content: z.string().min(1, { message: "Un texte doit être renseigné" }),
    }),
    informationContentBlockSchema.extend({
      type: z.literal("graphic"),
      file: fileSchema,
      img: fileSchema,
    }),
    informationContentBlockSchema.extend({
      type: z.literal("content"),
      contentDisplayMode: z.string(),
      contents: z.array(informationContentBlockContentSchema),
    }),
  ]
);
export type InformationContentBlock = z.infer<
  typeof informationContentBlockDiscriminatedSchema
>;

export const informationContentSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().nullable().optional(),
  title: z
    .string({ required_error: "Un titre doit être renseigné" })
    .min(1, "Un titre doit être renseigné"),
  referenceLabel: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  blocks: z.array(informationContentBlockDiscriminatedSchema),
  references: z.array(referenceSchema).nullable().optional(),
});
export type InformationContent = z.infer<typeof informationContentSchema>;

export const informationSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string({ required_error: "Un titre doit être renseigné" })
    .min(1, "Un titre doit être renseigné"),
  metaTitle: z
    .string({ required_error: "Un titre meta doit être renseigné" })
    .min(1, "Un titre meta doit être renseigné"),
  description: z
    .string({
      required_error: "Une description doit être renseignée",
    })
    .min(1, "Une description doit être renseignée"),
  metaDescription: z
    .string({
      required_error: "Une description meta doit être renseignée",
    })
    .min(1, "Une description meta doit être renseignée"),
  intro: z.string().nullable().optional(),
  referenceLabel: z.string().nullable().optional(),
  sectionDisplayMode: z.string().optional(),
  dismissalProcess: z.boolean(),
  updatedAt: z.string().nullable().optional(),
  contents: z.array(informationContentSchema),
  references: z.array(referenceSchema),
  displayDate: z.string().nullable().optional(),
});
export type Information = z.infer<typeof informationSchema>;
