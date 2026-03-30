export type NewsCdtnReferencesInsertInput = {
  cdtnId: string;
};

export type NewsCdtnReferencesArrRelInsertInput = {
  data: NewsCdtnReferencesInsertInput[];
};

export type NewsInsertInput = {
  createdAt?: string;
  content?: string;
  id?: string;
  metaDescription?: string;
  metaTitle?: string;
  title?: string;
  updatedAt?: string;
  displayDate?: string;
  news_cdtn_references?: NewsCdtnReferencesArrRelInsertInput;
};
