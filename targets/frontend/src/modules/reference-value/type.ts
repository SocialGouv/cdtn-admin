import { z } from "zod";

export const smicFormSchema = z.object({
  hourlyValue: z.coerce
    .number({ invalid_type_error: "Veuillez saisir un montant valide" })
    .positive("Le montant doit être positif"),
  applicationDate: z.string().min(1, "Veuillez saisir une date d'application"),
  note: z.string().optional(),
});

export type SmicFormData = z.infer<typeof smicFormSchema>;

export type SmicValue = {
  id: string;
  hourlyValue: number;
  applicationDate: string;
  note?: string | null;
  createdAt: string;
  createdBy?: string | null;
};
