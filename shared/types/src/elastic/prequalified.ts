import { PrequalifiedDoc } from "../hasura";
import { DocumentElasticWithSource } from "./common";

export type PrequalifiedElasticDocument = Omit<
  DocumentElasticWithSource<PrequalifiedDoc>,
  "slug"
>;
