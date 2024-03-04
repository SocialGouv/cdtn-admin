import { z } from "zod";

export const prequalifiedDocumentSchema = z.object({
  cdtnId: z.string(),
  title: z.string(),
});
export type PrequalifiedDocument = z.infer<typeof prequalifiedDocumentSchema>;

export const prequalifiedSchema = z.object({
  id: z.string(),
  variants: z.array(z.string()),
  documents: z.array(prequalifiedDocumentSchema),
});
export type Prequalified = z.infer<typeof prequalifiedSchema>;
