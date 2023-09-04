import { User } from "src/types";
import { SourceRoute } from "@socialgouv/cdtn-sources";

export type Agreement = {
  id: string;
  name: string;
};

export enum Status {
  TODO = "TODO",
  REDACTING = "REDACTING",
  REDACTED = "REDACTED",
  VALIDATING = "VALIDATING",
  VALIDATED = "VALIDATED",
  PUBLISHED = "PUBLISHED",
}

export type AnswerStatus = {
  id: string;
  createdAt: string;
  status: Status;
  userId: string;
  user: User;
};

export type Message = {
  id: string;
  label: string;
  content: string;
};

export type Question = {
  id: string;
  content: string;
  answers: Answer[];
  message?: Message;
};

export type Comments = {
  id: string;
  content: string;
  answer: Answer;
  answerId: string;
  userId: string;
  user: User;
  createdAt: string;
};

export type KaliArticle = {
  cid: string;
  id: string;
  path: string;
  label: string;
  agreementId: string;
  createdAt: string;
};

export type LegiArticle = {
  cid: string;
  id: string;
  label: string;
};

export type KaliReference = {
  kaliArticle: KaliArticle;
  label?: string;
};

export type LegiReference = {
  legiArticle: LegiArticle;
};

export type OtherReference = {
  label: string;
  url: string;
};

export type Document = {
  title: string;
  cdtnId: string;
  source: SourceRoute;
  slug: string;
};

export type CdtnReference = {
  document: Document;
};

export type OtherAnswer = "ANSWER" | "NOTHING" | "UNKNOWN";

export type Answer = {
  id: string;
  agreementId: string;
  questionId: string;
  otherAnswer?: OtherAnswer;
  agreement: Agreement;
  statuses: AnswerStatus[];
  status: AnswerStatus;
  content?: string;
  question: Omit<Question, "answers">;
  answerComments: Comments[];
  kaliReferences: KaliReference[];
  legiReferences: LegiReference[];
  otherReferences: OtherReference[];
  cdtnReferences: CdtnReference[];
};
