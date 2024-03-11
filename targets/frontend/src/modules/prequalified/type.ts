import { z } from "zod";
import { documentSchema } from "../../components/contributions";

export const prequalifiedSchema = z.object({
  id: z.string(),
  title: z.string(),
  variants: z.array(z.string()),
  documents: z.array(
    z.object({
      prequalifiedId: z.string(),
      documentId: z.string(),
      order: z.number(),
      document: documentSchema.optional(),
    })
  ),
});
export type Prequalified = z.infer<typeof prequalifiedSchema>;
