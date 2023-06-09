import { User } from "src/types";
import { SourceRoute } from "@socialgouv/cdtn-sources";

export type Agreement = {
  id: string;
  name: string;
};

export type Status =
  | "TODO"
  | "REDACTING"
  | "REDACTED"
  | "VALIDATING"
  | "VALIDATED"
  | "PUBLISHED";

export type AnswerStatus = {
  id: string;
  createdAt: string;
  status: Status;
  userId: string;
  user: User;
};
export type Answer = {
  id: string;
  agreementId: string;
  questionId: string;
  otherAnswer?: string;
  agreement: Agreement;
  statuses: AnswerStatus[];
  status: AnswerStatus;
  content?: string;
  question: Omit<Question, "answers">;
  answer_comments: Comments[];
  kali_references: { kali_article: KaliReference }[];
  legi_references: { legi_article: LegiReference }[];
  other_references: OtherReference[];
  cdtn_references: { document: CdtnReference }[];
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

export type KaliReference = {
  cid: string;
  id: string;
  path: string;
  agreement_id: string;
};

export type LegiReference = {
  cid: string;
  id: string;
  index: string;
};

export type OtherReference = {
  label: string;
  url: string;
};

export type CdtnReference = {
  title: string;
  cdtn_id: string;
  source: SourceRoute;
  slug: string;
};
