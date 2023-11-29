export type LegiArticle = {
  cid: string;
  id: string;
  label: string;
};

export type LegiReference = {
  legiArticle: LegiArticle;
};
