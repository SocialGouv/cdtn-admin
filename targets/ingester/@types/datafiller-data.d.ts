declare module "@socialgouv/datafiller-data" {
  export type ExternalDoc = {
    title: string;
    urls: string[];
  };
  export type AgreementsItem = {
    cid: string;
    groups: ArticleGroup[];
  };

  export type ArticleGroup = {
    id: string;
    selection: string[];
  };
}
