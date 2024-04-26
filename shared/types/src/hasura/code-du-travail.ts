import { CodeArticleData } from "@socialgouv/legi-data-types";
import { HasuraDocument } from "./common";

export type LaborCodeArticle = HasuraDocument<LaborCodeDoc, "code_du_travail">;

export type LaborCodeDoc = Pick<CodeArticleData, "cid" | "dateDebut" | "id"> & {
  description: string;
  html: string;
  url: string;
  notaHtml?: string;
};
