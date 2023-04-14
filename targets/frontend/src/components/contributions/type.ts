export type Agreement = {
  id: string;
  name: string;
};

export type Answer = {
  display_mode: string;
  content: string;
  agreements: Agreement;
};
export type Question = {
  id: string;
  content: string;
  answers: Answer[];
};
