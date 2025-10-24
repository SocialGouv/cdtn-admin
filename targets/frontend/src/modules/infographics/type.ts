import { z } from "zod";
import { fileSchema } from "../common/type";

export const infographicSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string({ required_error: "Un titre doit être renseigné" })
    .min(1, "Un titre doit être renseigné"),
  metaTitle: z
    .string({ required_error: "Un titre meta doit être renseigné" })
    .min(1, "Un titre meta doit être renseigné"),
  description: z
    .string({
      required_error: "Une description doit être renseignée"
    })
    .min(1, "Une description doit être renseignée"),
  metaDescription: z
    .string({
      required_error: "Une description meta doit être renseignée"
    })
    .min(1, "Une description meta doit être renseignée"),
  displayDate: z
    .string({
      required_error: "Une date de mise à jour doit être renseignée"
    })
    .min(1, "Une date de mise à jour doit être renseignée"),
  updatedAt: z.string(),
  createdAt: z.string(),
  transcription: z
    .string({
      required_error: "Une transcription de l'infographie doit être renseignée"
    })
    .min(1, "Une transcription de l'infographie doit être renseignée"),
  svgFile: fileSchema,
  pdfFile: fileSchema
});

export type Infographic = z.infer<typeof infographicSchema>;
