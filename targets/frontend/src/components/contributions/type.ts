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

export type User = {
  name: string;
};
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
  content?: string;
  question: Omit<Question, "answers">;
};
export type Question = {
  id: string;
  content: string;
  answers: Answer[];
};
