import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  email: z.string(),
  created_at: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const agreementSchema = z.object({
  id: z.string(),
  name: z.string(),
  kaliId: z.string(),
  unextended: z.boolean(),
});
export type Agreement = z.infer<typeof agreementSchema>;

export const statusSchema = z.enum([
  "TODO",
  "REDACTING",
  "REDACTED",
  "VALIDATING",
  "VALIDATED",
  "TO_PUBLISH",
  "PUBLISHING",
  "PUBLISHED",
  "NOT_PUBLISHED",
]);
export type Status = z.infer<typeof statusSchema>;

export const answerStatusSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  status: statusSchema,
  userId: z.string(),
  user: userSchema,
});
export type AnswerStatus = z.infer<typeof answerStatusSchema>;

export const messageSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  seoLabel: z.string(),
  contentAgreement: z.string(),
  contentLegal: z.string(),
  contentAgreementWithoutLegal: z.string(),
  contentNotHandled: z.string(),
  contentNotHandledWithoutLegal: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

export type CommentsAndStatuses = (AnswerStatus | Comments) & {
  createdAtDate: Date;
};

export const kaliArticleSchema = z.object({
  cid: z.string(),
  id: z.string(),
  path: z.string(),
  label: z
    .string({ required_error: "Un libellé doit être renseigné" })
    .min(1, "Un libellé doit être renseigné"),
  agreementId: z.string(),
  createdAt: z.string(),
});
export type KaliArticle = z.infer<typeof kaliArticleSchema>;

export const legiArticleSchema = z.object({
  cid: z.string(),
  id: z.string(),
  label: z.string(),
});
export type LegiArticle = z.infer<typeof legiArticleSchema>;

export const kaliReferenceSchema = z.object({
  kaliArticle: kaliArticleSchema.partial(),
  label: z
    .string({ required_error: "Un libellé doit être renseigné" })
    .min(1, "Un libellé doit être renseigné"),
});
export type KaliReference = z.infer<typeof kaliReferenceSchema>;

export const legiReferenceSchema = z.object({
  legiArticle: legiArticleSchema,
});
export type LegiReference = z.infer<typeof legiReferenceSchema>;

export const otherReferenceSchema = z.object({
  label: z
    .string({ required_error: "Un libellé doit être renseigné" })
    .min(1, "Un libellé doit être renseigné"),
  url: z
    .string()
    .url("Le format du lien est invalide")
    .optional()
    .or(z.literal("")),
});
export type OtherReference = z.infer<typeof otherReferenceSchema>;

export const documentSchema = z.object(
  {
    title: z.string(),
    cdtnId: z.string(),
    source: z.string(),
    slug: z.string(),
  },
  { invalid_type_error: "Le document doit être renseigné" }
);
export type Document = z.infer<typeof documentSchema>;

export const cdtnReferenceSchema = z.object({
  document: documentSchema,
});
export type CdtnReference = z.infer<typeof cdtnReferenceSchema>;

const answerBaseSchema = z.object({
  id: z.string().uuid(),
  agreementId: z.string(),
  questionId: z.string().uuid(),
  contentType: z.enum(
    [
      "ANSWER",
      "NOTHING",
      "CDT",
      "UNFAVOURABLE",
      "UNKNOWN",
      "SP",
      "GENERIC_NO_CDT",
    ],
    {
      required_error: "Un type de réponse doit être sélectionné",
      invalid_type_error: "Un type de réponse doit être sélectionné",
    }
  ),
  contentServicePublicCdtnId: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  description: z
    .string()
    .max(170, {
      message: "La description ne doit pas contenir plus de 170 caractères",
    })
    .nullable()
    .optional(),
  messageBlockGenericNoCDT: z.string().nullable().optional(),
  updatedAt: z.string(),
  displayDate: z.string(),
});

export const questionBaseSchema = z.object({
  id: z.string().uuid(),
  content: z
    .string({
      required_error: "Une question doit être renseignée",
    })
    .min(1, "Une question doit être renseignée"),
  order: z.number(),
  message_id: z.string().uuid().optional(),
  seo_title: z.string().optional(),
});

export const commentsSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  answer: answerBaseSchema,
  answerId: z.string(),
  user: userSchema,
  userId: z.string(),
  createdAt: z.string(),
});
export type Comments = z.infer<typeof commentsSchema>;

export const exportStatus = z.object({
  createdAt: z.string(),
});
export type ExportStatus = z.infer<typeof exportStatus>;

export const answerRelationSchema = answerBaseSchema.extend({
  agreement: agreementSchema,
  statuses: z.array(answerStatusSchema),
  status: answerStatusSchema,
  kaliReferences: z.array(kaliReferenceSchema),
  legiReferences: z.array(legiReferenceSchema),
  otherReferences: z.array(otherReferenceSchema),
  cdtnReferences: z.array(cdtnReferenceSchema),
  contentFichesSpDocument: documentSchema.nullable().optional(),
  question: questionBaseSchema,
  answerComments: z.array(commentsSchema),
  document_exports: z.array(
    z.object({
      export_es_status: exportStatus,
    })
  ),
});
export type Answer = z.infer<typeof answerRelationSchema>;

export const questionRelationSchema = questionBaseSchema.extend({
  answers: z.array(answerBaseSchema.deepPartial()).optional(),
  message: messageSchema.deepPartial().optional(),
});
export type Question = z.infer<typeof questionRelationSchema>;
export type QuestionBase = z.infer<typeof questionBaseSchema>;
