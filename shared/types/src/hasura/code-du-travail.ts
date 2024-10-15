import { CodeArticleData } from "@socialgouv/legi-data-types";
import { HasuraDocument } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type LaborCodeArticle = HasuraDocument<LaborCodeDoc, typeof SOURCES.CDT>;

export type LaborCodeDoc = Pick<CodeArticleData, "cid" | "dateDebut" | "id"> & {
  description: string;
  html: string;
  url: string;
  notaHtml?: string;
};
