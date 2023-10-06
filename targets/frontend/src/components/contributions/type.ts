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
  content: z.string(),
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
    .string({ required_error: "Un libellé doit être renseigner" })
    .min(1, "un label doit être renseigner"),
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
    .string({ required_error: "un libellé doit être renseigner" })
    .min(1, "un libellé doit être renseigner"),
  url: z
    .string({ required_error: "Une url doit être renseigner" })
    .url("le format de l'url est invalide"),
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

export const contentTypeSchema = z.enum([
  "ANSWER",
  "NOTHING",
  "CDT",
  "UNFAVOURABLE",
  "UNKNOWN",
  "SP",
]);
export type ContentType = z.infer<typeof contentTypeSchema>;

const answerBaseSchema = z.object({
  id: z.string().uuid(),
  agreementId: z.string(),
  questionId: z.string().uuid(),
  contentType: z.string({
    required_error: "Un type de réponse doit être sélectionner",
    invalid_type_error: " type de réponse doit être sélectionner",
  }),
  contentServicePublicCdtnId: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const questionBaseSchema = z.object({
  id: z.string().uuid(),
  content: z
    .string({
      required_error: "une question doit être renseigner",
    })
    .min(1, "une question doit être renseigner"),
  order: z.number(),
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

const answerRelationSchema = answerBaseSchema.extend({
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

export const answerFormBaseSchema = answerRelationSchema.extend({
  id: z.string().uuid().optional(),
  agreementId: z.string().optional(),
  questionId: z.string().uuid().optional(),
  updatedAt: z.string().optional(),
  question: questionBaseSchema.deepPartial().optional(),
  answerComments: z.array(commentsSchema.deepPartial()).optional(),
  agreement: agreementSchema.deepPartial().optional(),
  statuses: z.array(answerStatusSchema.deepPartial()).optional(),
  status: answerStatusSchema.deepPartial().optional(),
});

export const questionRelationSchema = questionBaseSchema.extend({
  answers: z.array(answerBaseSchema.deepPartial()).optional(),
  message: messageSchema.deepPartial().optional(),
});
export type Question = z.infer<typeof questionRelationSchema>;

const answerWithAnswerSchema = answerFormBaseSchema.extend({
  contentType: z.literal("ANSWER"),
  content: z
    .string({
      required_error: "Une réponse doit être renseigner",
      invalid_type_error: "Une réponse doit être renseigner",
    })
    .min(1, "Une réponse doit être renseigner"),
});
const answerWithNothingSchema = answerFormBaseSchema.extend({
  contentType: z.literal("NOTHING"),
});
const answerWithCdtSchema = answerFormBaseSchema.extend({
  contentType: z.literal("CDT"),
});
const answerWithUnfavourableSchema = answerFormBaseSchema.extend({
  contentType: z.literal("UNFAVOURABLE"),
});
const answerWithUnknownSchema = answerFormBaseSchema.extend({
  contentType: z.literal("UNKNOWN"),
});
const answerWithSPSchema = answerFormBaseSchema.extend({
  contentType: z.literal("SP"),
  contentFichesSpDocument: documentSchema,
});

export const answerFormSchema = z.discriminatedUnion("contentType", [
  answerWithAnswerSchema,
  answerWithNothingSchema,
  answerWithCdtSchema,
  answerWithUnfavourableSchema,
  answerWithUnknownSchema,
  answerWithSPSchema,
]);
export type AnswerForm = z.infer<typeof answerFormSchema>;
