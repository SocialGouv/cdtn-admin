export type Agreement = {
  id: string;
  name: string;
};

export type Answer = {
  display_mode: string;
  agreements: Agreement;
  status: string;
};
export type Question = {
  id: string;
  content: string;
  answers: Answer[];
};
