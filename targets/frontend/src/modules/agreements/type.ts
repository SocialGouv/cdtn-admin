import { z } from "zod";

export const agreementSchema = z.object({
  id: z.string(),
  isSupported: z.boolean(),
  kali_id: z.string().optional(),
  legifranceUrl: z.string().url().optional(),
  name: z.string(),
  rootText: z.string().optional(),
  shortName: z.string(),
  workerNumber: z.number().min(0).optional(),
});

export type Agreement = z.infer<typeof agreementSchema>;
