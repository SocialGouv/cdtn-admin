import { Prequalified } from "../hasura";
import { DocumentElasticWithSource } from "./common";

export type PrequalifiedElasticDocument = Omit<
  DocumentElasticWithSource<Prequalified>,
  "slug"
>;
