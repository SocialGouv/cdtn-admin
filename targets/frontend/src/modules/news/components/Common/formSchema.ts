import { z } from "zod";
import { newsSchema } from "../../type";

export const buildNewsFormSchema = (requireImage: boolean) =>
  newsSchema
    .omit({ updatedAt: true, createdAt: true })
    .extend({ newImage: z.array(z.any()).optional() })
    .superRefine((data, ctx) => {
      const hasImage = (data.newImage?.length ?? 0) > 0 || !!data.imageFile;
      if (requireImage && !hasImage) {
        ctx.addIssue({
          code: "custom",
          path: ["newImage"],
          message: "Une image doit être ajoutée",
        });
      }
      if (hasImage && !data.imageAlt?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["imageAlt"],
          message: "Le texte alternatif doit être renseigné",
        });
      }
      if (hasImage && !data.imageLicense) {
        ctx.addIssue({
          code: "custom",
          path: ["imageLicense"],
          message: "Les droits d'utilisation doivent être renseignés",
        });
      }
      if (
        hasImage &&
        data.imageLicense === "source" &&
        !data.imageAuthor?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["imageAuthor"],
          message: "L'auteur ou la source doit être renseigné",
        });
      }
      const articleIds = data.legiReferences.map(
        ({ legiArticle }) => legiArticle.id
      );
      if (new Set(articleIds).size !== articleIds.length) {
        ctx.addIssue({
          code: "custom",
          path: ["legiReferences"],
          message: "Cet article est déjà ajouté",
        });
      }
    });

export type NewsFormData = z.infer<ReturnType<typeof buildNewsFormSchema>>;
