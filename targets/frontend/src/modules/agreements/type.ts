import { z } from "zod";

export const agreementSchema = z.object({
  id: z
    .string({ required_error: "Un IDCC doit être renseigné" })
    .length(4, "L'IDCC doit être composé de 4 chiffres (ex: 0016, 3239, ...)"),
  isSupported: z.boolean(),
  kali_id: z.string().nullish(),
  publicationDate: z.string().nullish(),
  legifranceUrl: z.string().url().nullish(),
  name: z
    .string({ required_error: "Un nom doit être renseigné" })
    .min(1, "Un nom doit être renseigné"),
  rootText: z.string().nullish(),
  shortName: z
    .string({ required_error: "Un nom doit être renseigné" })
    .min(1, "Un nom doit être renseigné"),
  workerNumber: z.number().min(0).nullish(),
  synonyms: z.string().array(),
  updatedAt: z.string(),
});

export type Agreement = z.infer<typeof agreementSchema>;
