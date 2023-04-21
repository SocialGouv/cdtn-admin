export type Agreement = {
  id: string;
  name: string;
};

export type Answer = {
  idCc: string;
  idQuestion: string;
  otherAnswer?: string;
  agreement: Agreement;
  status: string;
  content?: string;
  question: Omit<Question, "answers">;
};
export type Question = {
  id: string;
  content: string;
  answers: Answer[];
};
