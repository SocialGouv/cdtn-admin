import { EditorialContent, EditorialContentDocSchema } from "@shared/types";
import { z } from "zod";

export const UpdateEditorialContentInputSchema = z.object({
  cdtnId: z.string(),
  document: EditorialContentDocSchema,
  metaDescription: z.string(),
  slug: z.string(),
  title: z.string(),
});

export type UpdateEditorialContentInput = z.infer<
  typeof UpdateEditorialContentInputSchema
>;

export const callApiUpdateEditorialContent = async (
  tokenJwt: string,
  data: UpdateEditorialContentInput
): Promise<EditorialContent> => {
  const response = await fetch("/api/content/editorial-contents", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${tokenJwt}`,
    },
    method: "POST",
  });
  if (response.ok) {
    const data = (await response.json()) as EditorialContent;
    return data;
  } else {
    throw new Error("Failed");
  }
};
