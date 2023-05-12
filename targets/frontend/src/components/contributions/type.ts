export type Agreement = {
  id: string;
  name: string;
};

export type AnswerStatus = {
  id: string;
  createdAt: string;
  status: string;
  userId: string;
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
