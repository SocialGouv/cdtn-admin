import { z } from "zod";
import { documentSchema } from "../../components/contributions";

export const prequalifiedDocumentSchema = z.object({
  documentId: z.string(),
  order: z.number(),
  document: documentSchema.optional(),
});
export type PrequalifiedDocument = z.infer<typeof prequalifiedDocumentSchema>;

export const prequalifiedSchema = z.object({
  id: z.string(),
  title: z.string(),
  variants: z.array(z.string()),
  documents: z.array(prequalifiedDocumentSchema),
});
export type Prequalified = z.infer<typeof prequalifiedSchema>;
