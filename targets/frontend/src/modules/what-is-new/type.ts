import { z } from "zod";

export const whatIsNewItemSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  href: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

export type WhatIsNewItem = z.infer<typeof whatIsNewItemSchema>;

export const whatIsNewCategorySchema = z.object({
  kind: z.string().min(1, "Le type de catégorie est requis"),
  label: z.string().min(1, "Le libellé de la catégorie est requis"),
  items: z.array(whatIsNewItemSchema).default([]),
});

export type WhatIsNewCategory = z.infer<typeof whatIsNewCategorySchema>;

export const whatIsNewWeekSchema = z
  .object({
    id: z.string().min(1, "L'identifiant de la semaine est requis"),
    label: z.string().min(1, "Le libellé de la semaine est requis"),
    hasUpdates: z.boolean().default(false),
    categories: z.array(whatIsNewCategorySchema).optional(),
  })
  .superRefine((week, ctx) => {
    if (!week.hasUpdates && (week.categories?.length ?? 0) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Une semaine sans mise à jour ne doit pas contenir de catégories",
        path: ["categories"],
      });
    }
  });

export type WhatIsNewWeek = z.infer<typeof whatIsNewWeekSchema>;

export const whatIsNewMonthSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  period: z
    .string()
    .regex(/^\d{2}-\d{4}$/, "Le format doit être MM-YYYY (ex: 09-2025)"),
  label: z.string().min(1, "Le libellé est requis"),
  shortLabel: z.string().min(1, "Le libellé court est requis"),
  weeks: z.array(whatIsNewWeekSchema).default([]),
});

export type WhatIsNewMonth = z.infer<typeof whatIsNewMonthSchema>;
