import { z } from "zod";
import {
  documentSchema,
  legiReferenceSchema,
} from "../../components/contributions";

export const newsCdtnLinkSchema = z.object({
  type: z.literal("cdtn"),
  document: documentSchema,
});

export const newsExternalLinkSchema = z.object({
  type: z.literal("external"),
  label: z
    .string({ required_error: "Un libellé doit être renseigné" })
    .min(1, "Un libellé doit être renseigné"),
  url: z
    .string()
    .url("Le format du lien est invalide")
    .regex(/^https?:\/\//, "Le lien doit commencer par http:// ou https://"),
});

export const newsLinkSchema = z.discriminatedUnion("type", [
  newsCdtnLinkSchema,
  newsExternalLinkSchema,
]);
export type NewsLink = z.infer<typeof newsLinkSchema>;

export const newsImageFileSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z.string().min(1),
  size: z.string().nullable().optional(),
});
export type NewsImageFile = z.infer<typeof newsImageFileSchema>;

export const newsImageLicenseSchema = z.enum(["free", "source"]);
export type NewsImageLicense = z.infer<typeof newsImageLicenseSchema>;

export const newsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string({ required_error: "Un titre doit être renseigné" })
    .min(1, "Un titre doit être renseigné"),
  metaTitle: z
    .string({ required_error: "Un titre meta doit être renseigné" })
    .min(1, "Un titre meta doit être renseigné"),
  content: z
    .string({
      required_error: "Un contenu doit être renseigné",
    })
    .min(1, "Un contenu doit être renseigné"),
  metaDescription: z
    .string({
      required_error: "Une description meta doit être renseignée",
    })
    .min(1, "Une description meta doit être renseignée"),
  displayDate: z
    .string({
      required_error: "Une date de mise à jour doit être renseignée",
    })
    .min(1, "Une date de mise à jour doit être renseignée"),
  updatedAt: z.string(),
  createdAt: z.string(),
  links: z.array(newsLinkSchema),
  legiReferences: z.array(legiReferenceSchema),
  imageFile: newsImageFileSchema.nullable(),
  imageAlt: z.string().nullable(),
  imageAuthor: z.string().nullable(),
  imageLicense: newsImageLicenseSchema.nullable(),
});

export type News = z.infer<typeof newsSchema>;
