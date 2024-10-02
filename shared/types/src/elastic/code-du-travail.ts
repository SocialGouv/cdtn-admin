import { LaborCodeDoc } from "../hasura";
import { DocumentElasticWithSource } from "./common";

export type ElasticLaborCodeArticle = DocumentElasticWithSource<
  Omit<LaborCodeDoc, "cid">
>;
