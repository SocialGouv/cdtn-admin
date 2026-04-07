import { z } from "zod";
import { cdtnReferenceSchema } from "../../components/contributions";

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
  cdtnReferences: z.array(cdtnReferenceSchema),
});

export type News = z.infer<typeof newsSchema>;
