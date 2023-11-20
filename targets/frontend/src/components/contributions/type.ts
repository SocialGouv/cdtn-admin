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
});
export type Agreement = z.infer<typeof agreementSchema>;

export const statusSchema = z.enum([
  "TODO",
  "REDACTING",
  "REDACTED",
  "VALIDATING",
  "VALIDATED",
  "PUBLISHED",
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
  contentAgreement: z.string(),
  contentLegal: z.string(),
  contentNotHandled: z.string(),
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
    .min(1, "un label doit être renseigné"),
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
    .string({ required_error: "Un libellé doit être renseigner" })
    .min(1, "un label doit être renseigner"),
});
export type KaliReference = z.infer<typeof kaliReferenceSchema>;

export const legiReferenceSchema = z.object({
  legiArticle: legiArticleSchema,
});
export type LegiReference = z.infer<typeof legiReferenceSchema>;

export const otherReferenceSchema = z.object({
  label: z
    .string({ required_error: "un libellé doit être renseigné" })
    .min(1, "un nom doit être renseigné"),
  url: z
    .string({ required_error: "Une url doit être renseigné" })
    .url("le format du lien est invalide")
    .optional()
    .or(z.literal("")),
});
export type OtherReference = z.infer<typeof otherReferenceSchema>;

export const documentSchema = z.object({
  title: z.string(),
  cdtnId: z.string(),
  source: z.string(),
  slug: z.string(),
});
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
    ["ANSWER", "NOTHING", "CDT", "UNFAVOURABLE", "UNKNOWN", "SP"],
    {
      required_error: "Un type de réponse doit être sélectionné",
      invalid_type_error: " type de réponse doit être sélectionné",
    }
  ),
  contentServicePublicCdtnId: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const questionBaseSchema = z.object({
  id: z.string().uuid(),
  content: z
    .string({
      required_error: "une question doit être renseigné",
    })
    .min(1, "une question doit être renseigné"),
  order: z.number(),
  message_id: z
    .string({
      required_error: "Un message doit être sélectionné",
    })
    .uuid("Un message doit être sélectionné"),
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
});
export type Answer = z.infer<typeof answerRelationSchema>;

export const questionRelationSchema = questionBaseSchema.extend({
  answers: z.array(answerBaseSchema.deepPartial()).optional(),
  message: messageSchema.deepPartial().optional(),
});
export type Question = z.infer<typeof questionRelationSchema>;
