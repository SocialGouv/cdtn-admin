import { z } from "zod";

export const fileSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  url: z
    .string({
      required_error: "Un nom de fichier doit être renseigné",
      invalid_type_error: "Un nom de fichier doit être renseigné",
    })
    .min(1, "Un nom de fichier doit être renseigné")
    .regex(
      /.*(\.|\/)(svg|jpe?g|png|pdf)$/g,
      "Le format doit correspondre à une nom de fichier"
    ),
  altText: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
});
export type File = z.infer<typeof fileSchema>;
